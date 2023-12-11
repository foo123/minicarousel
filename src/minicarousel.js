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
    hasOwnProperty = Object.prototype.hasOwnProperty;

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
    return x < 0.5 ? 2*x*x : 1 - stdMath.pow(2 - 2*x, 2)/2;
}
function easing_cubic(x)
{
    return x < 0.5 ? 4*x*x*x : 1 - stdMath.pow(2 - 2*x, 3)/2;
}
function ease(a, b, t)
{
    return a + (b - a) * t;
}
function animate(el, props, speed, easing, oncomplete)
{
    if (!el) return function(){};
    easing = easing || easing_linear;
    var i = 0, n = 50, t, p, p2, o = {}, d = {}, stopped = false;
    function anim() {
        if (stopped || (0 >= speed))
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
        for (p in o)
        {
            if (!hasOwnProperty.call(o, p)) continue;
            if ('style' === p)
            {
                for (p2 in o.style)
                {
                    if (!hasOwnProperty.call(o.style, p2)) continue;
                    el.style[p2] = String(ease(o.style[p2][0], o.style[p2][1], easing(t))) + d[p2];
                }
            }
            else
            {
                el[p] = ease(o[p][0], o[p][1], easing(t));
            }
        }
        if (i <= n)
        {
            setTimeout(anim, speed/(n+1));
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
    anim();
    return function(){stopped = true;};
}
function get_visible_items(carousel)
{
    return stdMath.max(1, carousel ? (parseInt(window.getComputedStyle(carousel).getPropertyValue('--visible-items')) || 0) : 0);
}
function get_items(carousel)
{
    return carousel ? (carousel.children[0].children[0].children) : [];
}
function get_item_size(carousel)
{
    return carousel ? (carousel.children[0].children[0].children.length ? carousel.children[0].children[0].children[0].offsetWidth : 0) : 0;
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
    if (carousel && carousel.children[0] && carousel.children[0].classList.contains('minicarousel-viewport'))
    {
        /*if (0 > dur)
        {
            var running = true, a = carousel.children[0].scrollLeft, b = scroll;
            // duration | easing-function | delay | iteration-count | direction | fill-mode | play-state | name
            carousel.style.setPropertyValue('animation', String(dur)+'ms var(--easing) 0 1 forward both running minicarousel-animation');
            setTimeout(function() {
                running = false
                carousel.style.removeProperty('animation');
                carousel.children[0].scrollLeft = scroll;
            }, dur);
            requestAnimationFrame(function anim() {
                if (running)
                {
                    requestAnimationFrame(anim);
                    carousel.children[0].scrollLeft = ease(a, b, (parseFloat(window.getComputedStyle(carousel).getPropertyValue('--value')) || 0));
                }
            });
        }
        else
        {
            carousel.children[0].scrollLeft = scroll;
        }*/
        dir = 0 > dir ? -1 : 1;
        var N = get_visible_items(carousel),
            items = get_items(carousel),
            //size = get_item_size(carousel),
            //gap = get_gap(carousel),
            i, start, end,
            offset = get_offset(carousel),
            dur = get_animation_duration(carousel),
            easing = get_animation_easing(carousel),
            index = carousel.$minicarousel.index,
            amount = (carousel.children[0].offsetWidth || 0)/*(N * size + (N - 1) * gap)*/,
            sc = carousel.children[0].scrollLeft || 0,
            scamount = 0 > dir ? (index >= N ? -amount : -sc) : (index + N < items.length ? amount : carousel.children[0].scrollWidth - amount),
            scroll = stdMath.max(0, sc + scamount);

        // clear previous animation if any
        if (carousel.$minicarousel.stop) carousel.$minicarousel.stop();
        forEach.call(items, function(item) {
            item.classList.remove('minicarousel-animated');
            item.style.removeProperty('transform');
        });

        carousel.$minicarousel.index = items.length ? clamp(index + dir*N, 0, items.length - 1) : 0;
        start = index;
        end = index + N;
        for (i=start; i<end; ++i)
        {
            offset *= 2;
            if (0 <= i && i < items.length)
            {
                items[i].classList.add('minicarousel-animated');
                items[i].style.setProperty('transform', 'translateX(' + String(offset) + 'px)');
            }
        }
        setTimeout(function() {
            forEach.call(items, function(item) {
                item.classList.remove('minicarousel-animated');
                item.style.removeProperty('transform');
            });
        }, dur);
        carousel.$minicarousel.stop = animate(carousel.children[0], {scrollLeft: scroll}, dur, easing);
    }
}
function minicarousel(carousels)
{
    var self = this, carousels;
    if (!(self instanceof minicarousel)) return new minicarousel(carousels);

    var handler = function handler(evt) {
        var bt = evt.target.closest('a');
        if (!bt) return;
        if (bt.classList.contains('minicarousel-prev-bt'))
        {
            evt.preventDefault && evt.preventDefault();
            goTo(bt.parentNode, -1);
        }
        else if (bt.classList.contains('minicarousel-next-bt'))
        {
            evt.preventDefault && evt.preventDefault();
            goTo(bt.parentNode, +1);
        }
    };
    var resize = debounce(function resize() {
        forEach.call(carousels, function(el) {
            if (el.$minicarousel)
            {
                var N = get_visible_items(el), amount = el.children[0].offsetWidth;
                el.children[0].scrollLeft = stdMath.floor(el.$minicarousel.index / N) * amount;
            }
        });
    }, 200);
    carousels = carousels || [];
    forEach.call(carousels, function(el) {
        var prevBt = document.createElement('a'),
            nextBt = document.createElement('a');
        prevBt.href = '#';
        prevBt.classList.add('minicarousel-prev-bt');
        addEvent(prevBt, 'click', handler, {passive:false,capture:false});
        nextBt.href = '#';
        nextBt.classList.add('minicarousel-next-bt');
        addEvent(nextBt, 'click', handler, {passive:false,capture:false});
        el.appendChild(prevBt);
        el.appendChild(nextBt);
        el.$minicarousel = {stop:null,index:0};
        el.classList.add('minicarousel-js');
    });
    addEvent(window, 'resize', resize);
    self.dispose = function() {
        removeEvent(window, 'resize', resize);
        forEach.call(carousels, function(el) {
            var prevBt = el.querySelector('.minicarousel-prev-bt'),
                nextBt = el.querySelector('.minicarousel-next-bt');
            if (prevBt)
            {
                removeEvent(prevBt, 'click', handler, {passive:false,capture:false});
                prevBt.parentNode.removeChild(prevBt);
            }
            if (nextBt)
            {
                removeEvent(nextBt, 'click', handler, {passive:false,capture:false});
                nextBt.parentNode.removeChild(nextBt);
            }
            el.classList.remove('minicarousel-js');
            el.$minicarousel = null;
        });
        carousels = [];
    };
}
minicarousel.prototype = {
    constructor: minicarousel,
    dispose: null
};
minicarousel.VERSION = '1.0.0';

// export it
root.minicarousel = minicarousel;
})('undefined' !== typeof self ? self : window);