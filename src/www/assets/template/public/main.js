(function ($) {
    $(function () {

        var $window = $(window),
            $document = $(document),
            $content = $('.kss-content'),
            $sidebar = $('.kss-sidebar'),
            $sidebarInner = $('.kss-sidebar-inner'),
            $menu = $('.kss-menu'),
            $childMenu = $('.kss-menu-child'),
            $menuItem = $menu.find('.kss-menu-item'),
            $childMenuItem = $childMenu.find('.kss-menu-item'),
            ref = $menu.data('kss-ref'),
            prevScrollTop;

        // Dynamic menu activation
        function scrollSpy() {
            var scrollTop = $window.scrollTop(),
                $anchors = $childMenu.find('a'),
                activeIndex;
            $anchors.each(function (index) {
                var $target = $($(this).attr('href').replace(/\./g, '\\.')),
                    offsetTop = $target.offset().top,
                    offsetBottom = offsetTop + $target.outerHeight(true);
                if (offsetTop <= scrollTop && scrollTop < offsetBottom) {
                    activeIndex = index;
                    return false;
                }
            });
            $childMenuItem.removeClass('kss-active');
            if (typeof activeIndex !== 'undefined') {
                $childMenuItem.eq(activeIndex).addClass('kss-active');
            }
        }

        // Fix sidebar position
        function fixSidebar() {
            if ($sidebarInner.outerHeight() < $content.outerHeight()) {
                $sidebar.addClass('kss-fixed');
                if ($sidebarInner.outerHeight() > $window.height()) {
                    $sidebar.height($window.height());
                    $window.on('scroll', scrollSidebar).trigger('scroll');
                }
                else {
                    $sidebar.height('auto');
                    $window.off('scroll', scrollSidebar);
                }
            }
            else {
                $sidebar.removeClass('kss-fixed');
                $sidebar.height('auto');
                $window.off('scroll', scrollSidebar);
            }
        }

        // Synchronize sidebar scroll
        function scrollSidebar(event) {
            if (event.handled !== true) {
                var scrollTop = $window.scrollTop(),
                    maxScrollTop = $document.height() - $window.height();
                if (scrollTop >= 0 && prevScrollTop >= 0 && scrollTop <= maxScrollTop && prevScrollTop <= maxScrollTop) {  // for Mac scrolling
                    $sidebar.scrollTop($sidebar.scrollTop() + (scrollTop - prevScrollTop));
                }
                prevScrollTop = scrollTop;
                event.handled = true;
            }
            else {
                return false;
            }
        }

        // Activate current page item
        $menuItem.eq(ref).addClass('kss-active');

        // Append child menu and attach scrollSpy
        if ($childMenu.length) {
            $childMenu.show().appendTo($menuItem.eq(ref));
            $window.on('scroll', scrollSpy).trigger('scroll');
        }

        // Fixed sidebar
        if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
            $window.on('resize', fixSidebar).trigger('resize');
        }

        // Syntax hightlignting with Rainbow.js
        $('code.html').attr('data-language', 'html');
        $('code.css').attr('data-language', 'css');
        $('code.less, code.scss').attr('data-language', 'generic');

        // adding animation class for input event
        var onFocusFunc = function(e){
            var className = e.currentTarget.parentNode.className + ' selected';
            e.currentTarget.parentNode.className = className;
        };
        var onBlurFunc = function(e){
            var className = e.currentTarget.parentNode.className.replace(/ selected/,'');
            if (e.currentTarget.value.length < 1) {
                e.currentTarget.parentNode.className = className;
            }
        };
        var toggleRadios = function(e) {
            var radios = document.getElementsByClassName('radio');
            if (document.getElementsByClassName('selected').length > 0) {
                Array.prototype.filter.call(radios, function(e,i,a) {
                    e.classList.toggle('selected');
                }.bind(this));
            } else {
                e.currentTarget.classList.toggle('selected');
            }
        };

        var examples = document.getElementsByClassName('example');
        var radios = document.getElementsByClassName('radio');

        Array.prototype.filter.call(examples, function(e,i,a) {
            e.onfocus = onFocusFunc;
            e.onblur = onBlurFunc;
        }.bind(this));

        Array.prototype.filter.call(radios, function(e,i,a) {
            e.addEventListener('click', toggleRadios, false);
            e.addEventListener('touchend', toggleRadios, false);
        }.bind(this));

        $('html').toggleClass('should-use-desktop-nav', window.innerWidth > 767);
        $('html').toggleClass('no-should-use-desktop-nav', window.innerWidth <= 767);
        $window.on('resize', function() {
            $('html').toggleClass('should-use-desktop-nav', window.innerWidth > 767);
            $('html').toggleClass('no-should-use-desktop-nav', window.innerWidth <= 767);
        });

    });
}(jQuery));