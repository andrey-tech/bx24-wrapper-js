/**
 * Простая обертка на JavaScript для стандартной JS-библиотеки Битрикс24,
 * позволяющая избежать ада колбеков и работать c асинхроннми функциями и генераторами.
 *
 * @author    andrey-tech
 * @copyright 2019-2020 andrey-tech
 * @see https://github.com/andrey-tech/bx24-wrapper-js
 * @license   MIT
 *
 * @version 1.1.0
 *
 * v1.0.0 (01.12.2019) Начальный релиз
 * v1.1.0 (28.05.2020) Рефракторинг
 * 
 */

class BX24Wrapper {

    /**
     * Конструктор
     */
    constructor() {

        /**
         * Проверка загрузки стандартной библиотеки Битрикс24
         * <script src="//api.bitrix24.com/api/v1/"></script>
         */
        if (! window.BX24) {
            throw "Can't find BX24 libary! See https://dev.1c-bitrix.ru/rest_help/js_library/index.php";
        }

        /**
         * Максимальное число команд в одном пакетном запросе callBatch() (не более 50)
         * @type {Number}
         */
        this.batchSize = 50;

        /**
         * Функция для обновления прогресса выполнения пакетных запросов
         * @type {Object}
         */
        this.progress = percent => {};

        /**
         * Максимальное число запросов к API в секунду (не более 2-х)
         * @type {Number}
         * @see https://dev.1c-bitrix.ru/rest_help/rest_sum/index.php
         */
        this.throttle = 2;

        /**
         * Последний объект ajaxResult, полученный от библиотеки Битрикс24
         * @type {Object}
         * @see https://dev.1c-bitrix.ru/rest_help/js_library/rest/callMethod.php
         */
        this.lastResult = {};

        /**
         * Время отправки последнего запроса к API, миллисекунды
         * @type {Number}
         */
        this.lastRequestTime = 0;
    }

    /**
     * Вызывает BX24.init()
     * @return {Object} Promise
     * @see https://dev.1c-bitrix.ru/rest_help/js_library/system/init.php
     */
    init() {
        return new Promise(resolve => {
            BX24.init(resolve);
        });
    }

    /**
     * Вызывает BX24.callMethod() c заданным методом и параметрами и возвращает промис
     * @param {String} method Метод
     * @param  {Object} params Параметры запроса
     * @return {Object} Promise
     * @see https://dev.1c-bitrix.ru/rest_help/js_library/rest/callMethod.php
     */
    async callMethod(method, params = {}) {
        await this.throttleCall();
        return new Promise((resolve, reject) => {
            let callback = result => {
                this.lastResult = result;
                if (result.status != 200 || result.error()) {
                    return reject(`${result.error()} (callMethod ${method}: ${JSON.stringify(params)})`);
                }
                return resolve(result.data());
            };
            BX24.callMethod(method, params, callback);
        });
    }

    /**
     * Вызывает BX24.callMethod() с заданным списочным методом и параметрами и возвращает промис
     * @param {String} method Списочный метод
     * @param  {Object} params Параметры запроса
     * @return {Object} Promise
     * @see https://dev.1c-bitrix.ru/rest_help/js_library/rest/callMethod.php
     */
    async callListMethod(method, params = {}) {
        await this.throttleCall();
        return new Promise((resolve, reject) => {
            let data = [];
            this.progress(0);

            let callback = async (result) => {
                this.lastResult = result;

                if (result.status != 200 || result.error()) {
                    return reject(`${result.error()} (callListMethod ${method}: ${JSON.stringify(params)})`);
                }

                data = data.concat(result.data());

                let total = result.total();
                this.progress(total > 0 ? Math.round(100 * data.length / total) : 100);

                if (! result.more()) {
                    return resolve(data);
                }

                await this.throttleCall();
                result.next();
            };
            BX24.callMethod(method, params, callback);
        });
    }

    /**
     * Вызывает BX24.callMethod() с заданным списочным методом и параметрами и возвращает генератор
     * Реализует быстрый алгоритм, описанный в https://dev.1c-bitrix.ru/rest_help/rest_sum/start.php
     * @param {String} method Списочный метод
     * @param  {Object} params Параметры запроса
     * @return {Object} Generator
     * @see https://dev.1c-bitrix.ru/rest_help/js_library/rest/callMethod.php
     */
    async *fetchList(method, params = {}) {
        params.order = params.order || {};
        params.filter = params.filter || {};
        params.order['ID'] = 'ASC';
        params.filter['>ID'] = 0;
        params.start = -1;

        let counter = 0,
            total = 0;

        this.progress(0);

        do {
            let data = await this.callMethod(method, params),
                result = this.lastResult;

            if (params.filter['>ID'] == 0) {
                total = result.total();
            }

            counter += data.length;
            this.progress(total > 0 ? Math.round(100 * counter / total) : 100);

            if (data.length == 0) {
                break;
            }
 
            yield data;

            if (! result.more()) {
                break;
            }
 
            params.filter['>ID'] = data[data.length - 1]['ID'];

        } while (true);
    }

    /**
     * Вызывает BX24.callBatch() с числом запросов не более 50 и возвращает Promise
     * @param  {Array|Object} method Пакет запросов
     * @param  {Bool} haltOnError Прерывать исполнение пакета в при возникновении ошибки
     * @return {Object} Promise
     * @see https://dev.1c-bitrix.ru/rest_help/js_library/rest/callBatch.php
     */
    async callBatch(calls, haltOnError = true) {
        await this.throttleCall();
        return new Promise((resolve, reject) => {
            let callback = results => {
                this.lastResult = results;
                let data;
                if (Array.isArray(results)) {
                    data = [];
                    for (let result of results) {
                        if (result.status != 200 || result.error()) {
                            return reject(`${result.error()} (callBatch ${result.query.method}: ${result.query.data})`);
                        }
                        data.push(result.data());
                    }
                } else {
                    data = {};
                    for (let key of Object.keys(results)) {
                        let result = results[ key ];
                        if (result.status != 200 || result.error()) {
                            return reject(`${result.error()} (callBatch ${result.query.method}: ${result.query.data})`);                            
                        }
                        data[ key ] = result.data();
                    }                    
                }
                return resolve(data);
            };
            BX24.callBatch(calls, callback, haltOnError);
        });
    }

    /**
     * Вызывает BX24.callBatch() с произвольным числом запросов и возвращает Promise
     * @param  {Array} method Пакет запросов
     * @param  {Bool} haltOnError Прерывать исполнение пакета в при возникновении ошибки
     * @return {Object} Promise
     * @see https://dev.1c-bitrix.ru/rest_help/js_library/rest/callBatch.php
     */
    async callLongBatch(calls, haltOnError = true) {
        if (! Array.isArray(calls)) {
            throw "Parameter 'calls' must be an array";
        }

        let data = [],
            total = calls.length,
            start = 0;

        this.progress(0);

        do {
            let end = start + this.batchSize,
                chunk = calls.slice(start, end);

            let response = await this.callBatch(chunk, haltOnError);
            data = data.concat(response);

            this.progress(total > 0 ? Math.round(100 * data.length / total) : 100);

            start = end;
            if (start >= total) {
                break;
            }

        } while(true);

        return data;
    }

    /**
     * Вызывает BX24.callBatch() с произвольным числом запросов и возвращает генератор
     * @param  {Array} method Пакет запросов
     * @param  {Bool} haltOnError Прерывать исполнение пакета в при возникновении ошибки
     * @return {Object} Generator
     * @see https://dev.1c-bitrix.ru/rest_help/js_library/rest/callBatch.php
     */
    async *callLargeBatch(calls, haltOnError = true) {
        if (! Array.isArray(calls)) {
            throw "Parameter 'calls' must be an array";
        }

        let total = calls.length,
            counter = 0,
            start = 0;

        this.progress(0);

        do {
            let end = start + this.batchSize,
                chunk = calls.slice(start, end);

            let data = await this.callBatch(chunk, haltOnError);
            
            counter += data.length;
            this.progress(total > 0 ? Math.round(100 * counter / total) : 100);

            yield data;

            start = end;
            if (start >= total) {
                break;
            }

        } while(true);
    }

    /**
     * Обеспечивет троттлинг запросов к API
     * @return {Object} Promise
     */
    throttleCall() {
        return new Promise(resolve => {
            let timeout = Math.round(this.lastRequestTime + 1e3 * (1 / this.throttle) - Date.now());
            if (timeout <= 0) {
                this.lastRequestTime = Date.now();
                return resolve();
            }
            setTimeout(() => {
                this.lastRequestTime = Date.now();
                return resolve();
            }, timeout);
        });
    }
}
