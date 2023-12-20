# minicarousel

Optimized responsive Carousel for Desktop and Mobile

**version: 1.1.1** (7kB minified)

**demo**

```html
<style type="text/css">
.minicarousel {
    width: 1200px;
    max-width: 100%;
    margin: 40px auto;
    --visible-items: 4;
    --scroll-by: 0; /* scroll by all visible items at once */
}
.minicarousel li {
    padding: 70px 0;
    text-align: center;
    font-weight: 900;
    border: 4px solid #d9d9d9;
}
@media (max-width: 800px) {
.minicarousel {
    --visible-items: 2;
    --scroll-by: 1; /* scroll one by one */
}
}
@media (max-width: 400px) {
.minicarousel {
    --visible-items: 1;
    --show-buttons: 0; /* hide prev/next buttons */
    --auto-scroll: auto; /* scroll manually */
}
}
</style>
<div class="minicarousel">
<div class="minicarousel-viewport">
<ul>
<li>1</li>
<li>2</li>
<li>3</li>
<li>4</li>
<li>5</li>
<li>6</li>
<li>7</li>
<li>8</li>
<li>9</li>
</ul>
</div>
</div>
<script>minicarousel(document.querySelectorAll('.minicarousel'));</script>
```

**output**

![minicarousel demo](/minicarousel.gif)