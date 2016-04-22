'use strict';

// ==UserScript==
// @name        bCourses Direct Link
// @namespace   https://thegavinli.com
// @description Bypasses the built-in file viewer in bCourses.
// @include     /^https://bcourses\.berkeley\.edu/courses/\d+(/((files|modules)/?)?)?($|\?)/
// @version     1.0.1
// @grant       none
// ==/UserScript==

function unescapeHTML(x) {
  var elem = document.createElement('span');
  elem.innerHTML = x;
  return elem.textContent;
}

function toArray(x) {
  return Array.prototype.slice.call(x);
}

function processModuleLink(title, func) {
  var nodes = document.querySelectorAll('#context_modules span[title="' + title + '"] + span > a.title');
  toArray(nodes).forEach(function (node) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', node.href);
    xhr.onload = function () {
      return func(node, xhr.response);
    };
    xhr.send();
  });
}

var pathName = document.location.pathname;
pathName = pathName.substring(0, pathName.length - pathName.endsWith('/'));

if (document.getElementById('context_modules')) {
  processModuleLink("Attachment", function (node, response) {
    var link = (response.match(/<a href="(\/courses\/\d+\/files\/\d+\/download)">/) || [])[1];
    if (link) {
      node.download = true;
      node.href = link;
    }
  });
  processModuleLink("External Url", function (node, response) {
    var a = response.indexOf('<li class="active">');
    if (a < 0) return;
    var b = response.indexOf('</li>', a);
    if (b < 0) return;
    var link = (response.substring(a, b).match(/<a href="([^"<>]*)"/) || [])[1];
    if (link) {
      node.target = "_blank";
      node.href = unescapeHTML(link);
    }
  });
}

if (pathName.endsWith("/files")) {
  (function (func) {
    var id = setInterval(function () {
      return func(id);
    }, 500);
  })(function (id) {
    var dir = document.getElementsByClassName('ef-directory')[0];
    if (dir) clearInterval(id);else return;
    dir.addEventListener("click", function (evt) {
      var target = evt.target;

      while (target.nodeName !== 'A') {
        if (target === dir) return;
        target = target.parentNode;
      }
      if (target.href.match(/\/files\/\d+\/download\b/)) {
        target.download = true;
        evt.stopPropagation();
      }
    });
  });
}

