angular.module("gettext",[]),angular.module("gettext").constant("gettext",function(a){return a}),angular.module("gettext").factory("gettextCatalog",["gettextPlurals","gettextFallbackLanguage","$http","$cacheFactory","$interpolate","$rootScope",function(a,b,c,d,e,f){function g(){f.$broadcast("gettextLanguageChanged")}var h,i="$$noContext",j='<span id="test" title="test" class="tested">test</span>',k=angular.element("<span>"+j+"</span>").html()!==j,l=function(a){return h.debug&&h.currentLanguage!==h.baseLanguage?h.debugPrefix+a:a},m=function(a){return h.showTranslatedMarkers?h.translatedMarkerPrefix+a+h.translatedMarkerSuffix:a};return h={debug:!1,debugPrefix:"[MISSING]: ",showTranslatedMarkers:!1,translatedMarkerPrefix:"[",translatedMarkerSuffix:"]",strings:{},baseLanguage:"en",currentLanguage:"en",cache:d("strings"),setCurrentLanguage:function(a){this.currentLanguage=a,g()},getCurrentLanguage:function(){return this.currentLanguage},setStrings:function(a,b){this.strings[a]||(this.strings[a]={});for(var c in b){var d=b[c];if(k&&(c=angular.element("<span>"+c+"</span>").html()),angular.isString(d)||angular.isArray(d)){var e={};e[i]=d,d=e}for(var f in d){var h=d[f];d[f]=angular.isArray(h)?h:[h]}this.strings[a][c]=d}g()},getStringFormFor:function(b,c,d,e){if(!b)return null;var f=this.strings[b]||{},g=f[c]||{},h=g[e||i]||[];return h[a(b,d)]},getString:function(a,c,d){var f=b(this.currentLanguage);return a=this.getStringFormFor(this.currentLanguage,a,1,d)||this.getStringFormFor(f,a,1,d)||l(a),a=c?e(a)(c):a,m(a)},getPlural:function(a,c,d,f,g){var h=b(this.currentLanguage);return c=this.getStringFormFor(this.currentLanguage,c,a,g)||this.getStringFormFor(h,c,a,g)||l(1===a?c:d),f&&(f.$count=a,c=e(c)(f)),m(c)},loadRemote:function(a){return c({method:"GET",url:a,cache:h.cache}).then(function(a){var b=a.data;for(var c in b)h.setStrings(c,b[c]);return a})}}}]),angular.module("gettext").directive("translate",["gettextCatalog","$parse","$animate","$compile","$window","gettextUtil",function(a,b,c,d,e,f){function g(a){return f.lcFirst(a.replace(j,""))}function h(a,b,c){var d=Object.keys(b).filter(function(a){return f.startsWith(a,j)&&a!==j});if(!d.length)return null;var e=angular.extend({},a),h=[];return d.forEach(function(d){var f=a.$watch(b[d],function(a){var b=g(d);e[b]=a,c(e)});h.push(f)}),a.$on("$destroy",function(){h.forEach(function(a){a()})}),e}var i=parseInt((/msie (\d+)/.exec(angular.lowercase(e.navigator.userAgent))||[])[1],10),j="translateParams";return{restrict:"AE",terminal:!0,compile:function(e,g){f.assert(!g.translatePlural||g.translateN,"translate-n","translate-plural"),f.assert(!g.translateN||g.translatePlural,"translate-plural","translate-n");var j=f.trim(e.html()),k=g.translatePlural,l=g.translateContext;return 8>=i&&"<!--IE fix-->"===j.slice(-13)&&(j=j.slice(0,-13)),{post:function(e,g,i){function m(b){b=b||null;var h;k?(e=o||(o=e.$new()),e.$count=n(e),h=a.getPlural(e.$count,j,k,b,l)):h=a.getString(j,b,l);var i=g.contents();if(0!==i.length){if(h===f.trim(i.html()))return void(p&&d(i)(e));var m=angular.element("<span>"+h+"</span>");d(m.contents())(e);var q=m.contents();c.enter(q,g),c.leave(i)}}var n=b(i.translateN),o=null,p=!0;i.translateN&&e.$watch(i.translateN,function(){m()}),e.$on("gettextLanguageChanged",function(){m()});var q=h(e,i,m);m(q),p=!1}}}}}]),angular.module("gettext").factory("gettextFallbackLanguage",function(){var a={},b=/([^_]+)_[^_]+$/;return function(c){if(a[c])return a[c];var d=b.exec(c);return d?(a[c]=d[1],d[1]):null}}),angular.module("gettext").filter("translate",["gettextCatalog",function(a){function b(b,c){return a.getString(b,null,c)}return b.$stateful=!0,b}]),angular.module("gettext").factory("gettextPlurals",function(){function a(a){return b[a]||(b[a]=a.split("_").shift()),b[a]}var b={pt_BR:"pt_BR"};return function(b,c){switch(a(b)){case"ay":case"bo":case"cgg":case"dz":case"fa":case"id":case"ja":case"jbo":case"ka":case"kk":case"km":case"ko":case"ky":case"lo":case"ms":case"my":case"sah":case"su":case"th":case"tt":case"ug":case"vi":case"wo":case"zh":return 0;case"is":return c%10!=1||c%100==11?1:0;case"jv":return 0!=c?1:0;case"mk":return 1==c||c%10==1?0:1;case"ach":case"ak":case"am":case"arn":case"br":case"fil":case"fr":case"gun":case"ln":case"mfe":case"mg":case"mi":case"oc":case"pt_BR":case"tg":case"ti":case"tr":case"uz":case"wa":case"zh":return c>1?1:0;case"lv":return c%10==1&&c%100!=11?0:0!=c?1:2;case"lt":return c%10==1&&c%100!=11?0:c%10>=2&&(10>c%100||c%100>=20)?1:2;case"be":case"bs":case"hr":case"ru":case"sr":case"uk":return c%10==1&&c%100!=11?0:c%10>=2&&4>=c%10&&(10>c%100||c%100>=20)?1:2;case"mnk":return 0==c?0:1==c?1:2;case"ro":return 1==c?0:0==c||c%100>0&&20>c%100?1:2;case"pl":return 1==c?0:c%10>=2&&4>=c%10&&(10>c%100||c%100>=20)?1:2;case"cs":case"sk":return 1==c?0:c>=2&&4>=c?1:2;case"sl":return c%100==1?1:c%100==2?2:c%100==3||c%100==4?3:0;case"mt":return 1==c?0:0==c||c%100>1&&11>c%100?1:c%100>10&&20>c%100?2:3;case"gd":return 1==c||11==c?0:2==c||12==c?1:c>2&&20>c?2:3;case"cy":return 1==c?0:2==c?1:8!=c&&11!=c?2:3;case"kw":return 1==c?0:2==c?1:3==c?2:3;case"ga":return 1==c?0:2==c?1:7>c?2:11>c?3:4;case"ar":return 0==c?0:1==c?1:2==c?2:c%100>=3&&10>=c%100?3:c%100>=11?4:5;default:return 1!=c?1:0}}}),angular.module("gettext").factory("gettextUtil",function(){function a(a,b,c){if(!a)throw new Error("You should add a "+b+" attribute whenever you add a "+c+" attribute.")}function b(a,b){return 0===a.indexOf(b)}function c(a){var b=a.charAt(0).toLowerCase();return b+a.substr(1)}var d=function(){return String.prototype.trim?function(a){return"string"==typeof a?a.trim():a}:function(a){return"string"==typeof a?a.replace(/^\s*/,"").replace(/\s*$/,""):a}}();return{trim:d,assert:a,startsWith:b,lcFirst:c}});