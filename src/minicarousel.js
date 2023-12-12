/**
* minicarousel
* Optimized responsive Carousel for Desktop and Mobile
* @VERSION: 1.0.0
* https://github.com/foo123/minicarousel
*/
(function(root) {
"use strict";

var stdMath = Math,
    forEach = Array.prototype.forEach,
    hasOwnProperty = Object.prototype.hasOwnProperty,
    trim_re = /^\s+|\s+$/g,
    trim = String.prototype.trim
    ? function(s) {return s.trim();}
    : function(s) {return s.replace(trim_re, '');}
;

function hasEventOptions()
{
    if (null == hasEventOptions.passiveSupported)
    {
        var options = {};
        try {
            Object.defineProperty(options, 'passive', {
                get: function(){
                    hasEventOptions.passiveSupported = true;
                    return false;
                }
            });
            window.addEventListener('test', null, options);
            window.removeEventListener('test', null, options);
        } catch(e) {
            hasEventOptions.passiveSupported = false;
        }
    }
    return hasEventOptions.passiveSupported;
}
function addEvent(target, event, handler, options)
{
    if (target.attachEvent) target.attachEvent('on' + event, handler);
    else target.addEventListener(event, handler, hasEventOptions() ? options : ('object' === typeof options ? !!options.capture : !!options));
}
function removeEvent(target, event, handler, options)
{
    if (target.detachEvent) target.detachEvent('on' + event, handler);
    else target.removeEventListener(event, handler, hasEventOptions() ? options : ('object' === typeof options ? !!options.capture : !!options));
}
function hasClass(el, className)
{
    return el.classList
        ? el.classList.contains(className)
        : -1 !== (' ' + el.className + ' ').indexOf(' ' + className + ' ')
    ;
}
function addClass(el, className)
{
    if (el.classList) el.classList.add(className);
    else if (-1 === (' ' + el.className + ' ').indexOf(' ' + className + ' ')) el.className = '' === el.className ? className : (el.className + ' ' + className);
}
function removeClass(el, className)
{
    if (el.classList) el.classList.remove(className);
    else el.className = trim((' ' + el.className + ' ').replace(' ' + className + ' ', ' '));
}
function addStyle(el, prop, val)
{
    if (el.style.setProperty) el.style.setProperty(prop, val);
    else el.style[prop] = val;
}
function removeStyle(el, prop)
{
    if (el.style.removeProperty) el.style.removeProperty(prop);
    else el.style[prop] = '';
}
function debounce(fn, delay)
{
    var timer = null;
    return function() {
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function() {
            fn.apply(context, args);
        }, delay);
    };
}
function clamp(x, min, max)
{
    return stdMath.min(stdMath.max(x, min), max);
}
function easing_linear(x)
{
    return x;
}
function easing_quadratic(x)
{
    return x < 0.5 ? 2*x*x : (1 - stdMath.pow(2 - 2*x, 2)/2);
}
function easing_cubic(x)
{
    return x < 0.5 ? 4*x*x*x : (1 - stdMath.pow(2 - 2*x, 3)/2);
}
function interpolate(a, b, t, easing, isFinal)
{
    return isFinal ? b : (a + (b - a) * easing(t));
}
function animate(el, props, duration, easing, oncomplete)
{
    if (!el) return function() {};

    var i = 0, n = 49, t, p, p2, o = {}, d = {}, stopped = false;

    easing = easing || easing_linear;

    function animation() {
        if (stopped || (0 >= duration))
        {
            // force to completion
            t = 1;
            i = n+1;
        }
        else
        {
            t = i/n;
            ++i;
        }
        var isFinal = (i > n);
        for (p in o)
        {
            if (!hasOwnProperty.call(o, p)) continue;
            if ('style' === p)
            {
                for (p2 in o.style)
                {
                    if (!hasOwnProperty.call(o.style, p2)) continue;
                    addStyle(el, p2, String(interpolate(o.style[p2][0], o.style[p2][1], t, easing, isFinal)) + d[p2]);
                }
            }
            else
            {
                el[p] = interpolate(o[p][0], o[p][1], t, easing, isFinal);
            }
        }
        if (i <= n)
        {
            setTimeout(animation, duration/(n+1));
        }
        else
        {
            if (oncomplete) oncomplete(el);
        }
    }

    for (p in props)
    {
        if (!hasOwnProperty.call(props, p)) continue;
        if ('style' === p)
        {
            o.style = {};
            for (p2 in props.style)
            {
                if (!hasOwnProperty.call(props.style, p2)) continue;
                o.style[p2] = [parseFloat(el.style[p2]) || 0, parseFloat(props.style[p2]) || 0];
                if (el.style[p2])
                    d[p2] = '%'===el.style[p2].slice(-1) ? '%' : (-1!==['px','em','rem','pt','vw','vh'].indexOf(el.style[p2].slice(-2)) ? el.style[p2].slice(-2) : '');
                else
                    d[p2] = '';
            }
        }
        else
        {
            o[p] = [+(el[p]) || 0, +(props[p]) || 0];
        }
    }
    animation();
    return function(){stopped = true;};
}
function get_visible_items(carousel)
{
    return stdMath.max(1, carousel ? (parseInt(window.getComputedStyle(carousel).getPropertyValue('--visible-items')) || 0) : 0);
}
function get_visible_size(carousel)
{
    return carousel ? (carousel.children[0].clientWidth || 0) : 0;
}
function get_items(carousel)
{
    return carousel ? (carousel.children[0].children[0].children) : [];
}
function get_item_size(carousel)
{
    return carousel ? (carousel.children[0].children[0].children.length ? carousel.children[0].children[0].children[0].offsetWidth : 0) : 0;
}
function get_auto_scroll(carousel)
{
    return carousel ? window.getComputedStyle(carousel).getPropertyValue('--auto-scroll') : 'auto';
}
function get_gap(carousel)
{
    return stdMath.max(0, carousel ? (parseInt(window.getComputedStyle(carousel).getPropertyValue('--gap')) || 0) : 0);
}
function get_offset(carousel)
{
    return stdMath.max(0, carousel ? (parseFloat(window.getComputedStyle(carousel).getPropertyValue('--offset')) || 0) : 0);
}
function get_animation_duration(carousel)
{
    return stdMath.max(0, carousel ? (parseFloat(window.getComputedStyle(carousel).getPropertyValue('--animation')) || 0) : 0);
}
function get_animation_easing(carousel)
{
    var easing = carousel ? window.getComputedStyle(carousel).getPropertyValue('--easing') : '"linear"';
    if (easing && easing.length) easing = easing.slice(1, -1).toLowerCase();
    if ('cubic' === easing) return easing_cubic;
    else if ('quadratic' === easing) return easing_quadratic;
    return easing_linear;
}
function goTo(carousel, dir)
{
    if (carousel && carousel.children[0] && hasClass(carousel.children[0], 'minicarousel-viewport'))
    {
        /*if (0 > dur)
        {
            var running = true, a = carousel.children[0].scrollLeft, b = scroll;
            // duration | easing-function | delay | iteration-count | direction | fill-mode | play-state | name
            addStyle(carousel, 'animation', String(dur)+'ms var(--easing) 0 1 forward both running minicarousel-animation');
            setTimeout(function() {
                running = false
                removeStyle(carousel, 'animation');
                carousel.children[0].scrollLeft = scroll;
            }, dur);
            requestAnimationFrame(function anim() {
                if (running)
                {
                    requestAnimationFrame(anim);
                    carousel.children[0].scrollLeft = interpolate(a, b, (parseFloat(window.getComputedStyle(carousel).getPropertyValue('--value')) || 0));
                }
            });
        }
        else
        {
            carousel.children[0].scrollLeft = scroll;
        }*/
        dir = 0 > dir ? -1 : 1;
        var i, start, end, off,
            index = carousel.$minicarousel.index,
            items = get_items(carousel),
            n = items.length,
            N = get_visible_items(carousel),
            offset = get_offset(carousel),
            dur = get_animation_duration(carousel),
            easing = get_animation_easing(carousel),
            amount = get_visible_size(carousel) + get_gap(carousel),
            sc = carousel.children[0].scrollLeft || 0,
            scamount = 0 > dir ? (index >= N ? -amount : -sc) : (index + N < n ? amount : (carousel.children[0].scrollWidth - carousel.children[0].clientWidth - sc)),
            scroll = stdMath.max(0, sc + scamount);

        // clear previous animation if any
        if (carousel.$minicarousel.stop) carousel.$minicarousel.stop();
        forEach.call(items, function(item) {
            removeClass(item, 'minicarousel-animated');
            removeStyle(item, 'transform');
        });

        carousel.$minicarousel.index = n ? (0 > dir ? (index >= N ? (index - N) : 0) : (index + N < n ? (index + N) : stdMath.max(0, n - N))) : 0;
        if (index !== carousel.$minicarousel.index)
        {
            if (stdMath.abs(carousel.$minicarousel.index - index) !== N)
            {
                dur *= stdMath.abs(carousel.$minicarousel.index - index) / N;
            }
            off = offset;
            start = stdMath.max(0, index);
            end = stdMath.min(n, index + N);
            for (i=start; i<end; ++i)
            {
                if (0 <= i && i < n)
                {
                    addClass(items[i], 'minicarousel-animated');
                    addStyle(items[i], 'transform', 'translateX(' + String(off) + 'px)');
                }
                off *= 2;
            }
            setTimeout(function() {
                n = items.length;
                for (i=start; i<end; ++i)
                {
                    if (0 <= i && i < n)
                    {
                        removeClass(items[i], 'minicarousel-animated');
                        removeStyle(items[i], 'transform');
                    }
                }
            }, dur);
            carousel.$minicarousel.stop = animate(carousel.children[0], {scrollLeft: scroll}, dur, easing);
        }
    }
}
function minicarousel(carousels)
{
    var self = this;
    if (!(self instanceof minicarousel)) return new minicarousel(carousels);

    var handler = function handler(evt) {
        var bt = evt.target.closest('a');
        if (!bt) return;
        if (hasClass(bt, 'minicarousel-prev-bt'))
        {
            evt.preventDefault && evt.preventDefault();
            goTo(bt.parentNode, -1);
        }
        else if (hasClass(bt, 'minicarousel-next-bt'))
        {
            evt.preventDefault && evt.preventDefault();
            goTo(bt.parentNode, +1);
        }
    };
    var resize = debounce(function resize() {
        forEach.call(carousels, function(carousel) {
            if (carousel.$minicarousel)
            {
                if ('hidden' !== get_auto_scroll(carousel))
                {
                    carousel.$minicarousel.index = 0;
                }
                else
                {
                    var N = get_visible_items(carousel), amount = get_visible_size(carousel) + get_gap(carousel);
                    carousel.children[0].scrollLeft = stdMath.floor(carousel.$minicarousel.index / N) * amount;
                }
            }
        });
    }, 200);

    // dispose
    self.dispose = function() {
        removeEvent(window, 'resize', resize);
        forEach.call(carousels, function(carousel) {
            var prevBt = carousel.querySelector('.minicarousel-prev-bt'),
                nextBt = carousel.querySelector('.minicarousel-next-bt');
            if (prevBt)
            {
                removeEvent(prevBt, 'click', handler, {passive:false,capture:false});
                carousel.removeChild(prevBt);
            }
            if (nextBt)
            {
                removeEvent(nextBt, 'click', handler, {passive:false,capture:false});
                carousel.removeChild(nextBt);
            }
            //if (carousel.$minicarousel.stop) carousel.$minicarousel.stop();
            removeClass(carousel, 'minicarousel-js');
            carousel.$minicarousel = null;
        });
        carousels = [];
    };

    // init
    carousels = carousels || [];
    forEach.call(carousels, function(carousel) {
        var prevBt = document.createElement('a'),
            nextBt = document.createElement('a');
        prevBt.href = '#';
        addClass(prevBt, 'minicarousel-prev-bt');
        addEvent(prevBt, 'click', handler, {passive:false,capture:false});
        nextBt.href = '#';
        addClass(nextBt, 'minicarousel-next-bt');
        addEvent(nextBt, 'click', handler, {passive:false,capture:false});
        carousel.appendChild(prevBt);
        carousel.appendChild(nextBt);
        carousel.$minicarousel = {stop:null, index:0};
        addClass(carousel, 'minicarousel-js');
    });
    addEvent(window, 'resize', resize);
}
minicarousel.prototype = {
    constructor: minicarousel,
    dispose: null
};
minicarousel.VERSION = '1.0.0';

// export it
root.minicarousel = minicarousel;
})('undefined' !== typeof self ? self : window);