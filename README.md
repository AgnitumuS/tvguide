# Телепрограмма
> Вступительное задание в ШРИ Яндекса 2016 №1 - телепрограмма


Используемые фреймфорки:
* Twitter Bootstrap (тема [Paper](https://bootswatch.com/paper/) от Bootswatch)
* jQuery
  * [jquery.scrollTo](https://github.com/flesler/jquery.scrollTo) (прокрутка страницы до требуемого элемента)
  * [jquery-visible](https://github.com/customd/jquery-visible) (проверка наличия элемента во viewport)
* [Bootstrap Multiselect](https://github.com/davidstutz/bootstrap-multiselect) (отрисовка красывых селекторов для выбора каналов и категрии передач)
* Node.js + Express (бекенд)
* Сборка фронтенда (выполняется с помощью npm-скриптов):
  * html собирается из [Jade](http://jade-lang.com/)
  * css - [Stylus](http://stylus-lang.com/) с [автопрефиксом](https://github.com/jenius/autoprefixer-stylus)
  * js - бандлер [rollup.js](http://rollupjs.org/) с компиляцией в es5 с помощью [Babel](https://babeljs.io/)


Мне не хотелось наполнять телепрограмму "рыбой", поэтому я начал искать API для получения данных телепрограммы.
После долгих поисков, я не нашел ничего лучше данных, предоставляемых сайтом [http://teleguide.info](teleguide.info).
Данные там передаются в формате XMLTV, запакованном через gzip.
Обработка и парсинг такого большого объема данных в браузере занимает заничтельное время (больше 30 секунд),
поэтому я решил сделать для заргузки и проебразования их в JSON небольшой бекенд на Node.js.

На фронтенде я ришил использовать Twitter Bootstrap (большое число готовых компонентов и работа на мобильных из коробки) и jQuery.







table-striped переделан чтобы скрытые tr  не влияли


multi-select x btn
http://stackoverflow.com/questions/20062218/how-do-i-clear-a-search-box-with-an-x-in-bootstrap-3



table-collapse
http://stackoverflow.com/questions/16389775/twitter-bootstrap-use-collapse-js-on-table-cells-almost-done