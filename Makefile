IN  := bCourses_Direct_Link.es6.js
OUT := bCourses_Direct_Link.user.js

$(OUT): $(IN) Makefile
	npm install
	node_modules/.bin/babel --presets es2015 $(IN) > $(OUT)
