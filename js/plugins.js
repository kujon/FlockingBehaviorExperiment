// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function f(){ log.history = log.history || []; log.history.push(arguments); if(this.console) { var args = arguments, newarr; try { args.callee = f.caller } catch(e) {}; newarr = [].slice.call(args); if (typeof console.log === 'object') log.apply.call(console.log, console, newarr); else console.log.apply(console, newarr);}};

// make it safe to use console.log always
(function(a){function b(){}for(var c="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),d;!!(d=c.pop());){a[d]=a[d]||b;}})
(function(){try{console.log();return window.console;}catch(a){return (window.console={});}}());


// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };

    window.hsl2rgb = function(h, s, l) {
        var m1, m2, hue;
        var r, g, b
        s /=100;
        l /= 100;
        if (s == 0)
            r = g = b = (l * 255);
        else {
            if (l <= 0.5)
                m2 = l * (s + 1);
            else
                m2 = l + s - l * s;
            m1 = l * 2 - m2;
            hue = h / 360;
            r = HueToRgb(m1, m2, hue + 1/3);
            g = HueToRgb(m1, m2, hue);
            b = HueToRgb(m1, m2, hue - 1/3);
        }
        return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
    }

    window.HueToRgb = function(m1, m2, hue) {
        var v;
        if (hue < 0)
            hue += 1;
        else if (hue > 1)
            hue -= 1;

        if (6 * hue < 1)
            v = m1 + (m2 - m1) * hue * 6;
        else if (2 * hue < 1)
            v = m2;
        else if (3 * hue < 2)
            v = m1 + (m2 - m1) * (2/3 - hue) * 6;
        else
            v = m1;

        return 255 * v;
    }

    window.sgn = function(val) {
        if(val > 0) {
            return 1;
        } else if(val < 0) {
            return -1;
        }
        return 0;
    }

    window.offScreenRect = function(wWidth, wHeight, width, height) {
        var xRect = Math.floor(Math.random() * 3),
            yRect = (function(){
                if(xRect !== 1) {
                    return Math.floor(Math.random() * 3);
                } else {
                    var val = Math.floor(Math.random() * 3);
                    while(val === 1) {
                        val = Math.floor(Math.random() * 3);
                    }
                    return val;
                }
            })(),
            rect = {};

            rect.minX = Math.random() * wWidth + (xRect - 1) * wWidth;
            rect.maxX = Math.min(rect.minX, Math.random() * wWidth + (xRect - 1) * wWidth);
            rect.minY = Math.random() * wHeight + (yRect - 1) * wHeight;
            rect.maxY = Math.min(rect.minY, Math.random() * wHeight + (yRect - 1) * wHeight);

        return rect;
    }

}());
