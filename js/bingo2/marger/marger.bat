@echo off
echo 初始==============================
del "build\\bingo.js"

cd ..

echo 合并基础==============================
copy /b /y core.js + promise.js + event.js + observe.js + using.js + package.js + linkNode.js + route.js + location.js + compiles.js "marger\\bingo.js""

echo 合并扩展==============================
copy "service\\base.js" "marger\\service.js"
copy "command\\base.js" "marger\\command.js"

cd marger

rem copy /b /y console-vsdoc.js + core-vsdoc.js + datavalue-vsdoc.js + Event-vsdoc.js + variable-vsdoc.js + Class-vsdoc.js  + linq-vsdoc.js + equals-vsdoc.js + fetch-vsdoc.js + package-vsdoc.js + route-vsdoc.js + cache-vsdoc.js bingo.core-vsdoc.js

echo 生成bingo.js==============================
copy bingo.js + service.js + command.js "build\\bingo.js"

echo 清除环境==============================
del bingo.js
del service.js
del command.js

echo 结束==============================
pause

