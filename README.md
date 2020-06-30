# Bitrix24 JS-lib Wrapper

![Bitrix24 logo](./assets/bitrix24-logo.png)

Класс-обертка на JavaScript для стандартной [JS-библиотеки](https://dev.1c-bitrix.ru/rest_help/js_library/index.php) Битрикс24.
Позволяет избежать [ада колбеков](http://callbackhell.ru) и работать c REST API Битрикс24
с помощью асинхронных функций и асинхронных генераторов ECMAScript 9.

## Содержание
<!-- MarkdownTOC levels="1,2,3,4,5,6" autoanchor="true" autolink="true" -->

- [Требования](#%D0%A2%D1%80%D0%B5%D0%B1%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F)
- [Класс BX24Wrapper](#%D0%9A%D0%BB%D0%B0%D1%81%D1%81-bx24wrapper)
- [Методы класса BX24Wrapper](#%D0%9C%D0%B5%D1%82%D0%BE%D0%B4%D1%8B-%D0%BA%D0%BB%D0%B0%D1%81%D1%81%D0%B0-bx24wrapper)
    - [Метод `async callMethod()`](#%D0%9C%D0%B5%D1%82%D0%BE%D0%B4-async-callmethod)
    - [Метод `async callListMethod()`](#%D0%9C%D0%B5%D1%82%D0%BE%D0%B4-async-calllistmethod)
    - [Метод `async *fetchList()`](#%D0%9C%D0%B5%D1%82%D0%BE%D0%B4-async-fetchlist)
    - [Метод `async callBatch()`](#%D0%9C%D0%B5%D1%82%D0%BE%D0%B4-async-callbatch)
    - [Метод `async callLongBatch()`](#%D0%9C%D0%B5%D1%82%D0%BE%D0%B4-async-calllongbatch)
    - [Метод `async *callLargeBatch()`](#%D0%9C%D0%B5%D1%82%D0%BE%D0%B4-async-calllargebatch)
    - [Метод `static createCalls()`](#%D0%9C%D0%B5%D1%82%D0%BE%D0%B4-static-createcalls)
    - [Метод `getLastResult()`](#%D0%9C%D0%B5%D1%82%D0%BE%D0%B4-getlastresult)
- [Обработка ошибок](#%D0%9E%D0%B1%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D0%BA%D0%B0-%D0%BE%D1%88%D0%B8%D0%B1%D0%BE%D0%BA)
- [Автор](#%D0%90%D0%B2%D1%82%D0%BE%D1%80)
- [Лицензия](#%D0%9B%D0%B8%D1%86%D0%B5%D0%BD%D0%B7%D0%B8%D1%8F)

<!-- /MarkdownTOC -->

<a id="%D0%A2%D1%80%D0%B5%D0%B1%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F"></a>
## Требования

- Стандартная [JS-библиотека](https://dev.1c-bitrix.ru/rest_help/js_library/index.php) Битрикс24,
которая представляет собой JS SDK для REST, что позволяет обращаться к REST прямо из front-end приложения 
не погружаясь в реализацию авторизации по OAuth 2.0.  
Библиотека подключается следующим образом:
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

<a id="%D0%9A%D0%BB%D0%B0%D1%81%D1%81-bx24wrapper"></a>
## Класс BX24Wrapper

- `new BX24Wrapper();`

Дополнительные параметры работы устанавливаются через свойства объекта класса `BX24Wrapper`.

Свойство                | По умолчанию     | Описание
----------------------- | ---------------- | --------
`batchSize`             | 50               | Максимальное число команд в одном пакете запросе ([не более 50](https://dev.1c-bitrix.ru/rest_help/general/lists.php))
`throttle`              | 2                | Максимальное число запросов к API в секунду ([не более 2-х запросов в секунду](https://dev.1c-bitrix.ru/rest_help/rest_sum/index.php))
`progress`              | `percent => {};` | Функция для контроля прогресса выполнения запросов в методах `callListMethod()`, `fetchList()`, `callLongBatch()` и `callLargeBatch()` (`percent` - прогресс, %)

```js
(async () => {
    let bx24 = new BX24Wrapper();

    // Устанавливаем максимальное число команд в одном пакете запросе
    bx24.batchSize = 25;
    
    // Устанавливаем троттлинг запросов к API на уровне 1 запрос в 2 секунды
    bx24.throttle = 0.5;

    // Устанавливаем собственную функцию для контроля прогресса выполнения запросов в процентах
    bx24.progress = percent => console.log(`Progress: ${percent}%`);

})().catch(error => console.log('Error:', error));
```
 
<a id="%D0%9C%D0%B5%D1%82%D0%BE%D0%B4%D1%8B-%D0%BA%D0%BB%D0%B0%D1%81%D1%81%D0%B0-bx24wrapper"></a>
## Методы класса BX24Wrapper

<a id="%D0%9C%D0%B5%D1%82%D0%BE%D0%B4-async-callmethod"></a>
### Метод `async callMethod()`

Вызывает указанный метод REST-сервиса с заданными параметрам и возвращает объект Promise (промис).  
Обертка метода [callMethod](https://dev.1c-bitrix.ru/rest_help/js_library/rest/callMethod.php) стандартной библиотеки.

- `callMethod(method [, params = {} ]);`  
    Параметры:
    - *string* `method` - строка, указывающая вызываемый метод REST-сервиса;
    - *object* `params` - объект параметров для метода REST-сервиса.
    
```js
(async () => {
    let bx24 = new BX24Wrapper();

    // Загружаем компанию по её ID
    let company = await bx24.callMethod('crm.company.get', { ID: 6 });
    console.log('Company:', company);

})().catch(error => console.log('Error:', error));
```

<a id="%D0%9C%D0%B5%D1%82%D0%BE%D0%B4-async-calllistmethod"></a>
### Метод `async callListMethod()`

Вызывает указанный **списочный** метод REST-сервиса с заданными параметрам и возвращает объект Promise (промис).
Позволяет одним вызовом загружать произвольное число сущностей с фильтрацией по параметрам в виде массива объектов
и контролировать прогресс выполнения загрузки.

- `callListMethod(listMethod [, params = {} ]);`  
    Параметры:
    - *string* `listMethod` - строка, указывающая вызываемый списочный метод REST-сервиса;
    - *object* `params` - объект параметров для списочного метода REST-сервиса.

```js
(async () => {
    let bx24 = new BX24Wrapper();

    // Устанавливаем собственную функцию для отображения прогресса выполнения загрузки в процентах
    bx24.progress = percent => console.log(`progress: ${percent}%`);

    let params = {
        filter: { CATALOD_ID: 21 },
        select: [ '*', 'PROPERTY_*' ]
    };

    // Загружем список всех товаров в заданном товарном каталоге
    let products = await bx24.callListMethod('crm.product.list', params);
    for (let product of products) {
        console.log('Product:', product);
    }

})().catch(error => console.log('Error:', error));
```

<a id="%D0%9C%D0%B5%D1%82%D0%BE%D0%B4-async-fetchlist"></a>
### Метод `async *fetchList()`

Вызывает указанный **списочный** метод REST-сервиса с заданными параметрам и возвращает объект Generator (генератор).
Позволяет одним вызовом загружать произвольное число сущностей с фильтрацией по параметрам в виде массива объектов
и контролировать прогресс выполнения загрузки.  
Реализует быстрый алгоритм, описанный в статье ["Как правильно выгружать большие объемы данных"](https://dev.1c-bitrix.ru/rest_help/rest_sum/start.php).  
Использование асинхронного генератора дает существенную экономию памяти при обработке большого количества сущностей.

- `fetchList(listMethod [, params = {} ]);`  
    Параметры:
    - *string* `listMethod` - строка, указывающая вызываемый списочный метод REST-сервиса;
    - *object* `params` - объект параметров для списочного метода REST-сервиса.

```js
(async () => {
    let bx24 = new BX24Wrapper();

    // Устанавливаем собственную функцию для отображения прогресса выполнения загрузки в процентах
    bx24.progress = percent => console.log(`progress: ${percent}%`);

    let params = {
        filter: { CATALOD_ID: 21 }
    };

    // Загружем список всех товаров в заданном товарном каталоге используя асинхронный генератор
    let generator = bx24.fetchList('crm.product.list', params);
    for await (let products of generator) {
        for (let product as $products) {
            console.log('Product:', product);
        }
    }

})().catch(error => console.log('Error:', error));
```

<a id="%D0%9C%D0%B5%D1%82%D0%BE%D0%B4-async-callbatch"></a>
### Метод `async callBatch()`

Отправляет пакет запросов к REST-сервису с максимальным числом команд в запросе 50 и возвращает Promise (промис).
Позволяет получить результаты пакетного выполнения запросов в виде массива или объекта.
Обертка метода [callBatch](https://dev.1c-bitrix.ru/rest_help/js_library/rest/callBatch.php) стандартной библиотеки.

- `callBatch(calls [, haltOnError = true ]);`  
    Параметры:
    - *array|object* `calls` - пакет запросов в виде массива или объекта;
    - *bool* `haltOnError` - флаг "прерывать исполнение пакета в при возникновении ошибки".

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

<a id="%D0%9C%D0%B5%D1%82%D0%BE%D0%B4-async-calllongbatch"></a>
### Метод `async callLongBatch()`

Отправляет пакет запросов к REST-сервису в виде массива с произвольным числом команд в запросе и возвращает Promise (промис).
Позволяет получить результаты пакетного выполнения запросов в виде массива.

- `callLongBatch(calls [, haltOnError = true ]);`  
    Параметры:
    - *array* `calls` - пакет запросов в виде массива;
    - *bool* `haltOnError` - флаг "прерывать исполнение пакета в при возникновении ошибки".

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

<a id="%D0%9C%D0%B5%D1%82%D0%BE%D0%B4-async-calllargebatch"></a>
### Метод `async *callLargeBatch()`

Отправляет пакет запросов к REST-сервису в виде массива с произвольным числом команд в запросе и возвращает Generator (генератор).
Позволяет получить результаты пакетного выполнения запросов в виде массива.
Использование асинхронного генератора дает существенную экономию памяти при работе с длинными пакетами запросов.

- `callLargeBatch(calls [, haltOnError = true ]);`  
    Параметры:
    - *array* `calls` - пакет запросов в виде массива;
    - *bool* `haltOnError` - флаг "прерывать исполнение пакета в при возникновении ошибки".

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

<a id="%D0%9C%D0%B5%D1%82%D0%BE%D0%B4-static-createcalls"></a>
### Метод `static createCalls()`

Создает пакет однотипных запросов для методов `callBatch()`, `callLongBatch()` и `callLargeBatch()`
и возвращает пакет запросов в виде массива.

- `BX24Wrapper.createCalls(method, items);`  
    Параметры:
    - *string* `method` - строка, указывающая вызываемый метод REST-сервиса во всех запросах;
    - *array* `items` - массив параметров запросов;

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


<a id="%D0%9C%D0%B5%D1%82%D0%BE%D0%B4-getlastresult"></a>
### Метод `getLastResult()`

Возвращает последний объект [ajaxResult](https://dev.1c-bitrix.ru/rest_help/js_library/rest/callMethod.php),
полученный от стандартной библиотеки Битрикс24.

- `getLastResult();`


<a id="%D0%9E%D0%B1%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D0%BA%D0%B0-%D0%BE%D1%88%D0%B8%D0%B1%D0%BE%D0%BA"></a>
## Обработка ошибок

При возникновении ошибок в методах класса выбрасываются исключения.  
Последний объект [ajaxResult](https://dev.1c-bitrix.ru/rest_help/js_library/rest/callMethod.php), полученный от стандартной библиотеки Битрикс24, доступен через вызов метода `getLastResult()`.

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

<a id="%D0%90%D0%B2%D1%82%D0%BE%D1%80"></a>
## Автор

© 2019-2020 andrey-tech

<a id="%D0%9B%D0%B8%D1%86%D0%B5%D0%BD%D0%B7%D0%B8%D1%8F"></a>
## Лицензия

Данный класс распространяется на условиях лицензии [MIT](./LICENSE).

