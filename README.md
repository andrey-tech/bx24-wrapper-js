# Bitrix24 JS-lib Wrapper

![Bitrix24 logo](./assets/bitrix24-logo.png)  

[![Latest Stable Version](https://poser.pugx.org/andrey-tech/bx24-wrapper-js/v)](https://packagist.org/packages/andrey-tech/bx24-wrapper-js)
[![GitHub stars](https://img.shields.io/github/stars/andrey-tech/bx24-wrapper-js)](https://github.com/andrey-tech/bx24-wrapper-js/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/andrey-tech/bx24-wrapper-js)](https://github.com/andrey-tech/bx24-wrapper-js/network)
[![GitHub watchers](https://img.shields.io/github/watchers/andrey-tech/bx24-wrapper-js)](https://github.com/andrey-tech/bx24-wrapper-js/watchers)
[![License](https://poser.pugx.org/andrey-tech/bx24-wrapper-js/license)](https://packagist.org/packages/andrey-tech/bx24-wrapper-js)

Класс-обертка на JavaScript для стандартной [JS-библиотеки](https://dev.1c-bitrix.ru/rest_help/js_library/index.php) Битрикс24.
Данный класс позволяет избежать [ада колбеков](http://callbackhell.ru) и работать c API Битрикс24
с помощью асинхронных функций и асинхронных генераторов ECMAScript 9.  

Разработчики на PHP могут воспользоваться классом-оберткой [andrey-tech/bitrix24-api-php](https://github.com/andrey-tech/bitrix24-api-php).

## Содержание
<!-- MarkdownTOC levels="1,2,3,4,5,6" autoanchor="true" autolink="true" lowercase="all" -->

- [Требования](#%D1%82%D1%80%D0%B5%D0%B1%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F)
- [Класс BX24Wrapper](#%D0%BA%D0%BB%D0%B0%D1%81%D1%81-bx24wrapper)
- [Методы класса BX24Wrapper](#%D0%BC%D0%B5%D1%82%D0%BE%D0%B4%D1%8B-%D0%BA%D0%BB%D0%B0%D1%81%D1%81%D0%B0-bx24wrapper)
    - [Метод `async callMethod()`](#%D0%BC%D0%B5%D1%82%D0%BE%D0%B4-async-callmethod)
    - [Метод `async callListMethod()`](#%D0%BC%D0%B5%D1%82%D0%BE%D0%B4-async-calllistmethod)
    - [Метод `async *fetchList()`](#%D0%BC%D0%B5%D1%82%D0%BE%D0%B4-async-fetchlist)
    - [Метод `async callBatch()`](#%D0%BC%D0%B5%D1%82%D0%BE%D0%B4-async-callbatch)
    - [Метод `async callLongBatch()`](#%D0%BC%D0%B5%D1%82%D0%BE%D0%B4-async-calllongbatch)
    - [Метод `async *callLargeBatch()`](#%D0%BC%D0%B5%D1%82%D0%BE%D0%B4-async-calllargebatch)
    - [Метод `static createCalls()`](#%D0%BC%D0%B5%D1%82%D0%BE%D0%B4-static-createcalls)
    - [Метод `getLastResult()`](#%D0%BC%D0%B5%D1%82%D0%BE%D0%B4-getlastresult)
- [Обработка ошибок](#%D0%BE%D0%B1%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D0%BA%D0%B0-%D0%BE%D1%88%D0%B8%D0%B1%D0%BE%D0%BA)
- [Автор](#%D0%B0%D0%B2%D1%82%D0%BE%D1%80)
- [Лицензия](#%D0%BB%D0%B8%D1%86%D0%B5%D0%BD%D0%B7%D0%B8%D1%8F)

<!-- /MarkdownTOC -->

<a id="%D1%82%D1%80%D0%B5%D0%B1%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F"></a>
## Требования

- Стандартная [JS-библиотека](https://dev.1c-bitrix.ru/rest_help/js_library/index.php) Битрикс24 v1.0,
которая представляет собой JavaScriptS SDK для REST API, что позволяет обращаться к API прямо из front-end приложения 
не погружаясь в реализацию авторизации по OAuth 2.0. **Для внешних приложений и вебхуков библиотека использоваться не может.**  

Подключение стандартной библиотеки Битрикс24 v1.0:
```html
<script src="//api.bitrix24.com/api/v1/"></script>
```
- Среда исполнения JavaScript, соответствущая спецификации ECMAScript 9 ([ECMAScript® 2018](http://www.ecma-international.org/ecma-262/9.0/index.html))
в части [поддержки асинхронных генераторов JavaScript](https://caniuse.com/#search=async%20generator) :
    - Google Chrome >= 63
    - Mozilla Firefox >= 55
    - Apple Safari >= 12
    - Microsoft Edge >= 79
    - Opera >= 50

<a id="%D0%BA%D0%BB%D0%B0%D1%81%D1%81-bx24wrapper"></a>
## Класс BX24Wrapper

Создание нового объекта класса `BX24Wrapper`:

- `new BX24Wrapper();`

Дополнительные параметры работы устанавливаются через свойства объекта класса `BX24Wrapper`.

| Свойство    | По умолчанию     | Описание                                                                                                                                                               |
|-------------|------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `batchSize` | 50               | Максимальное число команд в одном пакете запросе ([не более 50](https://dev.1c-bitrix.ru/rest_help/general/lists.php))                                                 |
| `throttle`  | 2                | Максимальное число запросов к API в секунду ([не более 2-х запросов в секунду](https://dev.1c-bitrix.ru/rest_help/rest_sum/index.php))                                 |
| `progress`  | `percent => {};` | Функция для контроля прогресса выполнения запросов в методах `callListMethod()`, `fetchList()`, `callLongBatch()` и `callLargeBatch()` (`percent` - прогресс 0-100, %) |

```js
(async () => {
    let bx24 = new BX24Wrapper();

    // Устанавливаем максимальное число команд в одном пакете запросе
    bx24.batchSize = 25;
    
    // Устанавливаем троттлинг запросов к API Битрикс24 на уровне 0,5 запросов в секунду,
    // то есть 1 запрос в 2 секунды
    bx24.throttle = 0.5;

    // Устанавливаем собственную функцию для вывода в веб-консоль прогресса выполнения запросов в процентах
    bx24.progress = percent => console.log(`Progress: ${percent}%`);

})().catch(error => console.log('Error:', error));
```
 
<a id="%D0%BC%D0%B5%D1%82%D0%BE%D0%B4%D1%8B-%D0%BA%D0%BB%D0%B0%D1%81%D1%81%D0%B0-bx24wrapper"></a>
## Методы класса BX24Wrapper

<a id="%D0%BC%D0%B5%D1%82%D0%BE%D0%B4-async-callmethod"></a>
### Метод `async callMethod()`

Вызывает указанный метод REST-сервиса с заданными параметрами и возвращает объект Promise (промис).  
Обертка метода [callMethod](https://dev.1c-bitrix.ru/rest_help/js_library/rest/callMethod.php) стандартной библиотеки Битрикс24.

- `callMethod(method [, params = {}, dataExtractor = null ]);`  
    Параметры:
    - *string* `method` - строка, указывающая вызываемый метод REST-сервиса;
    - *object* `params` - объект параметров для метода REST-сервиса;
    - *function* `dataExtractor` - функция для извлечения данных из результатов запроса.
    
```js
(async () => {
    let bx24 = new BX24Wrapper();

    // Загружаем компанию по её ID
    let company = await bx24.callMethod('crm.company.get', { ID: 6 });
    console.log('Company:', company);

})().catch(error => console.log('Error:', error));
```

<a id="%D0%BC%D0%B5%D1%82%D0%BE%D0%B4-async-calllistmethod"></a>
### Метод `async callListMethod()`

Вызывает указанный **списочный** метод REST-сервиса с заданными параметрами и возвращает объект Promise (промис).
Позволяет одним вызовом загружать произвольное число сущностей с фильтрацией по параметрам в виде массива объектов
и контролировать прогресс выполнения загрузки.

- `callListMethod(listMethod [, params = {}, dataExtractor = null ]);`  
    Параметры:
    - *string* `listMethod` - строка, указывающая вызываемый списочный метод REST-сервиса;
    - *object* `params` - объект параметров для списочного метода REST-сервиса;
    - *function* `dataExtractor` - функция для извлечения данных из результатов запроса.

```js
(async () => {
    let bx24 = new BX24Wrapper();

    // Устанавливаем собственную функцию для вывода в веб-консоль прогресса выполнения запросов в процентах
    bx24.progress = percent => console.log(`progress: ${percent}%`);

    let params = {
        filter: { CATALOD_ID: 21 },
        select: [ '*', 'PROPERTY_*' ]
    };

    // Загружем список всех товаров в заданном товарном каталоге CRM
    let products = await bx24.callListMethod('crm.product.list', params);
    for (let product of products) {
        console.log('Product:', product);
    }

    params = {
        filter: { iblockId: 11 },
        select: [ '*', 'id', 'iblockId' ]
    };
    
    // Задаем собственную функцию для извлечения массива товаров из объекта с результатами запроса
    let dataExtractor = data => data.products;
    
    // Загружем список всех товаров в заданном товарном каталоге
    products = await bx24.callListMethod('catalog.product.list', params, dataExtractor);
    for (let product of products) {
        console.log('Product:', product);
    }

})().catch(error => console.log('Error:', error));
```

<a id="%D0%BC%D0%B5%D1%82%D0%BE%D0%B4-async-fetchlist"></a>
### Метод `async *fetchList()`

Вызывает указанный **списочный** метод REST-сервиса с заданными параметрами и возвращает объект Generator (генератор).
Позволяет одним вызовом загружать произвольное число сущностей с фильтрацией по параметрам в виде массива объектов
и контролировать прогресс выполнения загрузки.  

Реализует быстрый алгоритм, описанный в статье ["Как правильно выгружать большие объемы данных"](https://dev.1c-bitrix.ru/rest_help/rest_sum/start.php). 
Использование асинхронного генератора дает существенную экономию памяти при обработке большого количества сущностей.

- `fetchList(listMethod [, params = {}, dataExtractor = null, idKey = 'ID' ]);`  
    Параметры:
    - *string* `listMethod` - строка, указывающая вызываемый списочный метод REST-сервиса;
    - *object* `params` - объект параметров для списочного метода REST-сервиса;
    - *function* `dataExtractor` - функция для извлечения данных из результатов запроса;
    - *string* `idKey` - имя поля ID загружаемых сущностей (`ID` - CRM или `id`).

```js
(async () => {
    let bx24 = new BX24Wrapper();

    // Устанавливаем собственную функцию для вывода в веб-консоль прогресса выполнения запросов в процентах
    bx24.progress = percent => console.log(`progress: ${percent}%`);

    let params = {
        filter: { CATALOD_ID: 21 }
    };

    // Загружем список всех товаров в заданном товарном каталоге CRM, используя асинхронный генератор
    let generator = bx24.fetchList('crm.product.list', params);
    for await (let products of generator) {
        for (let product of products) {
            console.log('Product:', product);
        }
    }

    params = {
        filter: { iblockId: 11 },
        select: [ '*', 'id', 'iblockId' ]
    };    
    
    // Задаем собственную функцию для извлечения массива товаров из объекта с результатами запроса   
    let dataExtractor = data => data.products;
    
    // Задаем имя поля ID загружаемых сущностей (товаров) в результатах запроса
    let idKey = 'id';

    // Загружем список всех товаров в заданном товарном каталоге, используя асинхронный генератор
    generator = bx24.fetchList('catalog.product.list', params, dataExtractor, idKey);
    for await (let products of generator) {
        for (let product of products) {
            console.log('Product:', product);
        }
    }
        
})().catch(error => console.log('Error:', error));
```

<a id="%D0%BC%D0%B5%D1%82%D0%BE%D0%B4-async-callbatch"></a>
### Метод `async callBatch()`

Отправляет пакет запросов к REST-сервису с максимальным числом команд в запросе 50 и возвращает Promise (промис).
Позволяет получить результаты пакетного выполнения запросов в виде массива или объекта.
Обертка метода [callBatch](https://dev.1c-bitrix.ru/rest_help/js_library/rest/callBatch.php) стандартной библиотеки Битрикс24.

- `callBatch(calls [, haltOnError = true, dataExtractor = null ]);`  
    Параметры:
    - *array|object* `calls` - пакет запросов в виде массива или объекта;
    - *bool* `haltOnError` - флаг "прерывать исполнение пакета в при возникновении ошибки";
    - *function* `dataExtractor` - функция для извлечения данных из результатов запроса.

```js
(async () => {
    let bx24 = new BX24Wrapper();

    // Пакет запросов в виде массива с максимальным числом команд в запросе 50
    let calls = [
        [ 'crm.deal.get', { id: 2880 } ],
        [ 'crm.contact.get', { id: 8 } ],
        [ 'crm.company.get', { id: 6 } ]
    ];

    // Отправляем пакет запросов в виде массива
    let response = await bx24.callBatch(calls, false);
    console.log('Response array:', response);

    // Пакет запросов в виде объекта с максимальным числом команд в запросе 50
    calls = {
        get_deal: [ 'crm.deal.get', { id: 2880 } ],
        get_company: [ 'crm.company.get', { id: '$result[get_deal][COMPANY_ID]' } ],
        get_contact: [ 'crm.contact.get', { id: '$result[get_deal][CONTACT_ID]' } ]
    };

    // Отправляем пакет запросов в виде объекта
    response = await bx24.callBatch(calls);
    console.log('Response object:', response);

})().catch(error => console.log('Error:', error));
```

<a id="%D0%BC%D0%B5%D1%82%D0%BE%D0%B4-async-calllongbatch"></a>
### Метод `async callLongBatch()`

Отправляет пакет запросов к REST-сервису в виде массива с произвольным числом команд в запросе и возвращает Promise (промис).
Позволяет получить результаты пакетного выполнения запросов в виде массива.

- `callLongBatch(calls [, haltOnError = true, dataExtractor = null ]);`  
    Параметры:
    - *array* `calls` - пакет запросов в виде массива;
    - *bool* `haltOnError` - флаг "прерывать исполнение пакета в при возникновении ошибки";
    - *function* `dataExtractor` - функция для извлечения данных из результатов запроса. 

```js
(async () => {
    let bx24 = new BX24Wrapper();

    // Длинный пакет запросов в виде массива с произвольным числом команд в запросе
    let calls = [
        [ 'crm.deal.get', { id: 2880 } ],
        [ 'crm.contact.get', { id: 8 } ],
        [ 'crm.company.get', { id: 6 } ],
        [ 'crm.product.get', { id: 1 } ]
    ];

    // Отправляем длинный пакет запросов в виде массива
    let response = await bx24.callLongBatch(calls);
    console.log('Response array:', response);

})().catch(error => console.log('Error:', error));
```

<a id="%D0%BC%D0%B5%D1%82%D0%BE%D0%B4-async-calllargebatch"></a>
### Метод `async *callLargeBatch()`

Отправляет пакет запросов к REST-сервису в виде массива с произвольным числом команд в запросе и возвращает Generator (генератор).
Позволяет получить результаты пакетного выполнения запросов в виде массива.
Использование асинхронного генератора дает существенную экономию памяти при работе с длинными пакетами запросов.

- `callLargeBatch(calls [, haltOnError = true, dataExtractor = null ]);`  
    Параметры:
    - *array* `calls` - пакет запросов в виде массива;
    - *bool* `haltOnError` - флаг "прерывать исполнение пакета в при возникновении ошибки";
    - *function* `dataExtractor` - функция для извлечения данных из результатов запроса. 

```js
(async () => {
    let bx24 = new BX24Wrapper();

    // Длинный пакет запросов в виде массива с произвольным числом команд в запросе
    let calls = [
        [ 'crm.deal.get', { id: 2880 } ],
        [ 'crm.contact.get', { id: 8 } ],
        [ 'crm.company.get', { id: 6 } ],
        [ 'crm.product.get', { id: 1 } ]
    ];

    // Отправляем длинный пакет запросов в виде массива, используя асинхронный генератор
    let generator = bx24.callLargeBatch(calls, true);
    for await (let response of generator) {
        console.log('Response array:', response);
    }

})().catch(error => console.log('Error:', error));
```

<a id="%D0%BC%D0%B5%D1%82%D0%BE%D0%B4-static-createcalls"></a>
### Метод `static createCalls()`

Создает пакет однотипных запросов для методов `callBatch()`, `callLongBatch()` и `callLargeBatch()`
и возвращает пакет запросов в виде массива.

- `BX24Wrapper.createCalls(method, items);`  
    Параметры:
    - *string* `method` - строка, указывающая вызываемый метод REST-сервиса во всех запросах;
    - *array* `items` - массив параметров запросов.

```js
(async () => {
    let bx24 = new BX24Wrapper();

    // Массив параметров однотипных запросов
    let items = [
        { id: 4 },
        { id: 6 },
        { id: 8 }
    ];

    // Создаем пакет запросов в виже массива
    let calls = BX24Wrapper.createCalls('crm.contact.get', items);

    // Отправляем пакет запросов в виде массива
    let response = await bx24.callBatch(calls);
    console.log('Response:', response);
  
})().catch(error => console.log('Error:', error));
```


<a id="%D0%BC%D0%B5%D1%82%D0%BE%D0%B4-getlastresult"></a>
### Метод `getLastResult()`

Возвращает последний объект [ajaxResult](https://dev.1c-bitrix.ru/rest_help/js_library/rest/callMethod.php),
полученный от стандартной библиотеки Битрикс24.

- `getLastResult();`


<a id="%D0%BE%D0%B1%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D0%BA%D0%B0-%D0%BE%D1%88%D0%B8%D0%B1%D0%BE%D0%BA"></a>
## Обработка ошибок

При возникновении ошибок в методах класса выбрасываются исключения.  
Последний объект [ajaxResult](https://dev.1c-bitrix.ru/rest_help/js_library/rest/callMethod.php),
полученный от стандартной библиотеки Битрикс24, может быть получен посредством метода `getLastResult()`.

```js
(async () => {

    let bx24 = new BX24Wrapper();

    // Загружаем несуществующую компанию по её ID и перехватываем возникающее исключение
    let company = await bx24.callMethod('crm.company.get', { ID: 9999999999 })
        .catch(error => {
            console.log('Error:', error);
            
            // Получаем последний объект ajaxResult, полученный от стандартной библиотеки Битрикс24
            let ajaxResult = bx24.getLastResult();
            console.log('ajaxResult:', ajaxResult);
        });

})().catch(error => console.log('Error:', error));
```

<a id="%D0%B0%D0%B2%D1%82%D0%BE%D1%80"></a>
## Автор

© 2019-2023 andrey-tech

<a id="%D0%BB%D0%B8%D1%86%D0%B5%D0%BD%D0%B7%D0%B8%D1%8F"></a>
## Лицензия

Данный класс распространяется на условиях лицензии [MIT](./LICENSE).
