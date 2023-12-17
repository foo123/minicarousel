/**
* minicarousel
* Optimized responsive Carousel for Desktop and Mobile
* @VERSION: 1.1.0
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
function computedStyle(el)
{
    return ('function' === typeof window.getComputedStyle ? window.getComputedStyle(el, null) : el.currentStyle) || {};
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
function animate(el, props, max, duration, easing, oncomplete)
{
    if (!el) return function() {};

    var i = 0, n = 49,//stdMath.min(49, stdMath.max(0, stdMath.floor(max - 1))),
        t, p, p2, o = {}, d = {}, stopped = false;

    easing = easing || easing_linear;

    function animation() {
        if (stopped || (0 >= duration) || (0 >= n))
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
function get_visible_items(carousel, style)
{
    style = style || computedStyle(carousel);
    return stdMath.max(1, parseFloat(style.getPropertyValue('--visible-items')) || 0);
}
function get_visible_size(carousel, style)
{
    //return carousel ? (carousel.children[0].clientWidth || 0) : 0;
    style = style || computedStyle(carousel);
    var N = stdMath.round(get_visible_items(carousel, style));
    return N * get_item_size(carousel) + (N - 1) * get_gap(carousel, style);
}
function get_items(carousel)
{
    return carousel ? (carousel.children[0].children[0].children) : [];
}
function get_item_size(carousel)
{
    return carousel ? (carousel.children[0].children[0].children.length ? carousel.children[0].children[0].children[0].offsetWidth : 0) : 0;
}
function get_auto_scroll(carousel, style)
{
    style = style || computedStyle(carousel);
    return style.getPropertyValue('--auto-scroll');
}
function get_gap(carousel, style)
{
    style = style || computedStyle(carousel);
    return stdMath.max(0, parseInt(style.getPropertyValue('--gap')) || 0);
}
function set_egap(carousel, style)
{
    style = style || computedStyle(carousel);
    addStyle(carousel, '--_egapnz', (parseFloat(style.getPropertyValue('--extra-gap')) || 0) > 0 ? 1 : 0);
}
function get_animation(carousel, style)
{
    style = style || computedStyle(carousel);
    var easing = style.getPropertyValue('--easing');
    if (easing && easing.length) easing = easing.slice(1, -1).toLowerCase();
    return {
        duration: stdMath.max(0, parseFloat(style.getPropertyValue('--animation')) || 0),
        easing: 'cubic' === easing ? easing_cubic : ('quadratic' === easing ? easing_quadratic : easing_linear),
        constantSpeed: !(parseFloat(style.getPropertyValue('--constant-animation')) || 0)
    };
}
function repaint(el)
{
    el && el.offsetWidth;
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
                    carousel.children[0].scrollLeft = interpolate(a, b, (parseFloat(computedStyle(carousel).getPropertyValue('--value')) || 0));
                }
            });
        }
        else
        {
            carousel.children[0].scrollLeft = scroll;
        }*/
        dir = 0 > dir ? -1 : 1;
        var style = computedStyle(carousel),
            i, s, e, a, d,
            index = carousel.$minicarousel.index,
            items = get_items(carousel, style),
            n = items.length,
            N = stdMath.round(get_visible_items(carousel, style)),
            anim = get_animation(carousel, style),
            amount = get_visible_size(carousel, style) + get_gap(carousel, style),
            sc = carousel.children[0].scrollLeft || 0,
            scamount = 0 > dir ? (index >= N ? -amount : -sc) : (index + N < n ? amount : (carousel.children[0].scrollWidth - carousel.children[0].clientWidth - sc)),
            scroll = stdMath.max(0, sc + scamount);

        // clear previous animation if any
        if (carousel.$minicarousel.stop) carousel.$minicarousel.stop();

        carousel.$minicarousel.index = n ? (0 > dir ? stdMath.max(0, index - N) : stdMath.min(index + N, stdMath.max(0, n - N))) : 0;
        a = stdMath.abs(carousel.$minicarousel.index - index);
        //if (0 < a)
        {
            if (0 < a && a < N && anim.constantSpeed) anim.duration *= a / N;
            s = clamp(index, 0, n - 1);
            e = clamp(index + N - 1, 0, n - 1);
            d = anim.duration / 2;
            if (0 > dir)
            {
                for (i=s; i<=e; ++i)
                {
                    a = clamp((e - i)*100, 0, d);
                    if (0 <= i && i < n)
                    {
                        addStyle(items[i], 'animation', 'minicarousel-animation-rev '+String(anim.duration - a)+'ms'+' ease '+String(a)+'ms');
                    }
                }
            }
            else
            {
                for (i=e; i>=s; --i)
                {
                    a = clamp((i - s)*100, 0, d);
                    if (0 <= i && i < n)
                    {
                        addStyle(items[i], 'animation', 'minicarousel-animation '+String(anim.duration - a)+'ms'+' ease '+String(a)+'ms');
                    }
                }
            }
            carousel.$minicarousel.stop = animate(
            carousel.children[0],
            {scrollLeft: scroll},
            stdMath.abs(scamount),
            anim.duration, anim.easing,
            function() {
                n = items.length;
                for (i=s; i<=e; ++i)
                {
                    if (0 <= i && i < n)
                    {
                        removeStyle(items[i], 'animation');
                        //if (hasClass(items[i], 'minicarousel-animated')) removeClass(items[i], 'minicarousel-animated');
                        //if (hasClass(items[i], 'minicarousel-animated-rev')) removeClass(items[i], 'minicarousel-animated-rev');
                    }
                }
            });
        }
    }
}
function minicarousel(carousels)
{
    var self = this, handler, update, resize, add, remove;
    if (!(self instanceof minicarousel)) return new minicarousel(carousels);

    // private methods
    handler = function handler(evt) {
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
    update = function update(carousel) {
        if (carousel.$minicarousel)
        {
            var style = computedStyle(carousel);
            set_egap(carousel, style);
            if ('hidden' !== get_auto_scroll(carousel))
            {
                carousel.$minicarousel.index = 0;
            }
            else
            {
                var N = stdMath.round(get_visible_items(carousel, style)),
                    amount = get_visible_size(carousel, style) + get_gap(carousel, style);
                carousel.children[0].scrollLeft = stdMath.floor(carousel.$minicarousel.index / N) * amount;
            }
        }
    };
    resize = debounce(function resize() {
        forEach.call(carousels, update);
    }, 200);
    add = function add(carousel) {
        var prevBt, nextBt;
        if ((prevBt = carousel.querySelector('.minicarousel-prev-bt')) && (carousel === prevBt.parentNode))
        {
            if (prevBt.$minicarousel) removeEvent(prevBt, 'click', prevBt.$minicarousel, {passive:false,capture:false});
            addEvent(prevBt, 'click', prevBt.$minicarousel = handler, {passive:false,capture:false});
        }
        else
        {
            prevBt = document.createElement('a');
            prevBt.href = '#';
            addClass(prevBt, 'minicarousel-prev-bt');
            addEvent(prevBt, 'click', prevBt.$minicarousel = handler, {passive:false,capture:false});
            carousel.appendChild(prevBt);
        }
        if ((nextBt = carousel.querySelector('.minicarousel-next-bt')) && (carousel === nextBt.parentNode))
        {
            if (nextBt.$minicarousel) removeEvent(prevBt, 'click', nextBt.$minicarousel, {passive:false,capture:false});
            addEvent(nextBt, 'click', nextBt.$minicarousel = handler, {passive:false,capture:false});
        }
        else
        {
            nextBt = document.createElement('a');
            nextBt.href = '#';
            addClass(nextBt, 'minicarousel-next-bt');
            addEvent(nextBt, 'click', nextBt.$minicarousel = handler, {passive:false,capture:false});
            carousel.appendChild(nextBt);
        }
        (carousel.children[0]) && (carousel.children[0].scrollLeft = 0);
        carousel.$minicarousel = {stop:null, index:0};
        set_egap(carousel);
        addClass(carousel, 'minicarousel-js');
    };
    remove = function remove(carousel) {
        var prevBt = carousel.querySelector('.minicarousel-prev-bt'),
            nextBt = carousel.querySelector('.minicarousel-next-bt');
        if (prevBt && (carousel === prevBt.parentNode))
        {
            carousel.removeChild(prevBt);
            if (prevBt.$minicarousel) removeEvent(prevBt, 'click', prevBt.$minicarousel, {passive:false,capture:false});
            prevBt.$minicarousel = null;
        }
        if (nextBt && (carousel === nextBt.parentNode))
        {
            carousel.removeChild(nextBt);
            if (nextBt.$minicarousel) removeEvent(nextBt, 'click', nextBt.$minicarousel, {passive:false,capture:false});
            nextBt.$minicarousel = null;
        }
        //if (carousel.$minicarousel.stop) carousel.$minicarousel.stop();
        removeClass(carousel, 'minicarousel-js');
        carousel.$minicarousel = null;
    };

    // dispose
    self.dispose = function() {
        removeEvent(window, 'resize', resize);
        forEach.call(carousels, remove);
        carousels = [];
    };
    // add
    self.add = function(carousel) {
        if (-1 === carousels.indexOf(carousel))
        {
            add(carousel);
            carousels.push(carousel);
        }
        return self;
    };
    // remove
    self.remove = function(carousel) {
        var idx;
        if (-1 !== (idx = carousels.indexOf(carousel)))
        {
            carousels.splice(idx, 1);
            remove(carousel);
        }
        return self;
    };
    self.update = function(carousel) {
        if (-1 !== carousels.indexOf(carousel)) update(carousel);
        return self;
    };

    // init
    carousels = Array.prototype.slice.call(carousels || []);
    forEach.call(carousels, add);
    addEvent(window, 'resize', resize);
}
minicarousel.prototype = {
    constructor: minicarousel,
    dispose: null,
    add: null,
    remove: null,
    update: null
};
minicarousel.VERSION = '1.1.0';
if (root.Element) root.Element.prototype.$minicarousel = null;
// export it
root.minicarousel = minicarousel;
})('undefined' !== typeof self ? self : window);