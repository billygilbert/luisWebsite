(function(window, $) {
	var IMAGE_ROOT = 'images/directing_page/';
	var FANCYBOX_IMAGE_OPTS = {
		transitionIn: 'none',
		transitionOut: 'none',
		titlePosition: 'over',
		titleFormat: function(title, currentArray, currentIndex) {
			return '<span id="fancybox-title-over">Image ' + (currentIndex + 1) + ' / ' + currentArray.length + (title.length ? ' &nbsp; ' + title : '') + '</span>';
		}
	};

	function productions() {
		return window.DIRECTING_PRODUCTIONS || [];
	}

	function imageUrl(production, filename) {
		if (!filename) {
			return '';
		}
		return IMAGE_ROOT + production.folder + '/' + encodeURIComponent(filename);
	}

	function caption(production) {
		var title = production.title || '';
		if (production.photoCredit) {
			return title + ' (photo: ' + production.photoCredit + ')';
		}
		return title;
	}

	function queryId() {
		var search = window.location.search || '';
		var match = search.match(/[?&]id=([^&]+)/);
		return match ? decodeURIComponent(match[1]) : '';
	}

	function findProduction(id) {
		var list = productions();
		for (var i = 0; i < list.length; i++) {
			if (list[i].id === id) {
				return list[i];
			}
		}
		return null;
	}

	function layoutSwitcher(active) {
		return $(
			'<nav class="layout-switcher">' +
				'<a href="directing.html"' + (active === 'full' ? ' class="is-active"' : '') + '>Layout A — Full page</a>' +
				'<span> / </span>' +
				'<a href="directing-index.html"' + (active === 'index' || active === 'detail' ? ' class="is-active"' : '') + '>Layout B — Index</a>' +
				'<span> / </span>' +
				'<a href="directing-popover.html"' + (active === 'popover' ? ' class="is-active"' : '') + '>Layout C — Popover</a>' +
			'</nav>'
		);
	}

	function creditList(production) {
		var $list = $('<ul class="production-credits"></ul>');
		var credits = production.credits || [];
		for (var i = 0; i < credits.length; i++) {
			$list.append(
				$('<li class="credit-row"></li>')
					.append($('<span class="credit-role"></span>').text(credits[i].role))
					.append($('<span class="credit-name"></span>').text(credits[i].name))
			);
		}
		return $list;
	}

	function headingBlock(production) {
		return $('<div class="production-copy"></div>')
			.append($('<div class="operatitle"></div>').text(production.title))
			.append($('<div class="company"></div>').html(production.composer ? ('<i>' + $('<div/>').text(production.composer).html() + '</i>') : ''))
			.append($('<div class="timedate"></div>').text(production.venue))
			.append($('<div class="description"></div>').text(production.dates));
	}

	function heroEl(production, sizeClass) {
		var src = imageUrl(production, production.hero);
		var $wrap = $('<div></div>').addClass(sizeClass || 'production-hero');
		if (!src) {
			$wrap.addClass('production-hero-empty').text(production.title);
			return $wrap;
		}
		return $wrap.append($('<img>').attr({
			src: src,
			alt: production.title
		}));
	}

	function thumbnailStrip(production, group, lazy) {
		var images = production.images || [];
		if (!images.length) {
			return $();
		}
		var $row = $('<div class="production-thumbs"></div>');
		for (var i = 0; i < images.length; i++) {
			var src = imageUrl(production, images[i]);
			var $img = $('<img>').attr({
				width: 90,
				height: 90,
				alt: production.title
			});
			if (lazy) {
				$img.addClass('js-prefetch-img').attr('data-src', src);
			} else {
				$img.attr('src', src);
			}
			if (i === images.length - 1) {
				$img.addClass('last');
			}
			$('<a></a>').attr({
				rel: group,
				href: src,
				title: caption(production)
			}).append($img).appendTo($row);
		}
		return $row;
	}

	function bindImageFancybox() {
		$('a[rel^="gallery_"]').fancybox(FANCYBOX_IMAGE_OPTS);
	}

	function prefetchProductionImages() {
		var queue = [];
		var seen = {};
		var list = productions();
		var i, j, production, filename, url, images;

		$('.js-prefetch-img').each(function() {
			url = $(this).attr('data-src');
			if (!url || seen[url]) {
				return;
			}
			seen[url] = true;
			queue.push(url);
		});

		for (i = 0; i < list.length; i++) {
			production = list[i];
			images = [].concat(production.hero ? [production.hero] : [], production.images || []);
			for (j = 0; j < images.length; j++) {
				filename = images[j];
				url = imageUrl(production, filename);
				if (!url || seen[url]) {
					continue;
				}
				seen[url] = true;
				queue.push(url);
			}
		}

		function applyToPage(src) {
			$('.js-prefetch-img').each(function() {
				if ($(this).attr('data-src') === src) {
					this.src = src;
					$(this).removeAttr('data-src').removeClass('js-prefetch-img');
				}
			});
		}

		function loadNext() {
			var src = queue.shift();
			var img;
			if (!src) {
				return;
			}
			img = new Image();
			img.onload = img.onerror = function() {
				applyToPage(src);
				loadNext();
			};
			img.src = src;
		}

		loadNext();
		loadNext();
		loadNext();
		loadNext();
	}

	function schedulePrefetch() {
		window.setTimeout(prefetchProductionImages, 250);
	}

	function popoverPanel(production) {
		var $panel = $('<div class="directing-popover-panel"></div>');
		$panel.append($('<div class="operatitle"></div>').text(production.title));
		$panel.append($('<div class="company"></div>').html(production.composer ? ('<i>' + $('<div/>').text(production.composer).html() + '</i>') : ''));
		$panel.append($('<div class="timedate"></div>').text(production.venue + ' — ' + production.dates));
		$panel.append(creditList(production));
		$panel.append(thumbnailStrip(production, 'gallery_' + production.id));
		return $panel;
	}

	function closeDirectingModal() {
		$(document).unbind('keydown.directingModal');
		$('.directing-modal-overlay').remove();
	}

	function showModalCredits($overlay) {
		$overlay.find('.directing-modal-credits').show();
		$overlay.find('.directing-modal-viewer').hide();
		$overlay.removeClass('is-viewing-photo');
	}

	function showModalPhoto($overlay, production, index) {
		var images = production.images || [];
		if (!images.length) {
			return;
		}
		if (index < 0) {
			index = images.length - 1;
		}
		if (index >= images.length) {
			index = 0;
		}
		$overlay.data('photoIndex', index);
		$overlay.find('.directing-modal-credits').hide();
		$overlay.find('.directing-modal-viewer').show();
		$overlay.find('.directing-modal-viewer-img').attr({
			src: imageUrl(production, images[index]),
			alt: production.title
		});
		$overlay.find('.directing-modal-viewer-meta').text((index + 1) + ' / ' + images.length + (production.photoCredit ? ' — ' + production.photoCredit : ''));
		$overlay.addClass('is-viewing-photo');
	}

	function openProductionPopover(production) {
		closeDirectingModal();

		var $overlay = $('<div class="directing-modal-overlay"></div>');
		var $modal = $('<div class="directing-modal"></div>');
		var $close = $('<a href="#" class="directing-modal-close" title="Close">×</a>');
		var $credits = $('<div class="directing-modal-credits"></div>').append(popoverPanel(production));
		var $viewer = $(
			'<div class="directing-modal-viewer">' +
				'<a href="#" class="directing-modal-back"></a>' +
				'<img class="directing-modal-viewer-img" alt="" />' +
				'<div class="directing-modal-viewer-meta"></div>' +
				'<div class="directing-modal-viewer-nav">' +
					'<a href="#" class="directing-modal-prev">Previous</a>' +
					'<span> · </span>' +
					'<a href="#" class="directing-modal-next">Next</a>' +
				'</div>' +
			'</div>'
		);

		$modal.append($close).append($credits).append($viewer);
		$overlay.append($modal).appendTo('body');

		$close.bind('click', function(e) {
			e.preventDefault();
			closeDirectingModal();
		});

		$overlay.bind('click', function(e) {
			if (e.target !== $overlay[0]) {
				return;
			}
			if ($overlay.hasClass('is-viewing-photo')) {
				showModalCredits($overlay);
			} else {
				closeDirectingModal();
			}
		});

		$credits.find('.production-thumbs a').bind('click', function(e) {
			e.preventDefault();
			showModalPhoto($overlay, production, $credits.find('.production-thumbs a').index(this));
		});

		$viewer.find('.directing-modal-back').text('← Back to ' + production.title).bind('click', function(e) {
			e.preventDefault();
			showModalCredits($overlay);
		});

		$viewer.find('.directing-modal-prev').bind('click', function(e) {
			e.preventDefault();
			showModalPhoto($overlay, production, ($overlay.data('photoIndex') || 0) - 1);
		});

		$viewer.find('.directing-modal-next, .directing-modal-viewer-img').bind('click', function(e) {
			e.preventDefault();
			showModalPhoto($overlay, production, ($overlay.data('photoIndex') || 0) + 1);
		});

		$(document).bind('keydown.directingModal', function(e) {
			if (e.keyCode === 27) {
				if ($overlay.hasClass('is-viewing-photo')) {
					showModalCredits($overlay);
				} else {
					closeDirectingModal();
				}
			} else if ($overlay.hasClass('is-viewing-photo') && e.keyCode === 37) {
				showModalPhoto($overlay, production, ($overlay.data('photoIndex') || 0) - 1);
			} else if ($overlay.hasClass('is-viewing-photo') && e.keyCode === 39) {
				showModalPhoto($overlay, production, ($overlay.data('photoIndex') || 0) + 1);
			}
		});
	}

	function bindPopoverFancybox() {
		$('a.directing-popover-trigger').unbind('click.directingPopover').bind('click.directingPopover', function(e) {
			e.preventDefault();
			var production = findProduction($(this).attr('data-id'));
			if (!production) {
				return false;
			}
			openProductionPopover(production);
			return false;
		});
	}

	function renderFull($root) {
		$root.empty().append(layoutSwitcher('full'));
		var list = productions();
		for (var i = 0; i < list.length; i++) {
			var production = list[i];
			var group = 'gallery_' + production.id;
			var $block = $('<section class="production-block"></section>');
			var $row = $('<div class="production-row"></div>')
				.append(heroEl(production))
				.append(headingBlock(production));
			$block.append($row).append(creditList(production)).append(thumbnailStrip(production, group, true));
			$root.append($block);
		}
		bindImageFancybox();
	}

	function renderIndex($root) {
		$root.empty().append(layoutSwitcher('index'));
		var $grid = $('<div class="directing-index-grid"></div>');
		var list = productions();
		for (var i = 0; i < list.length; i++) {
			var production = list[i];
			var href = 'directing-detail.html?id=' + encodeURIComponent(production.id);
			var $card = $('<a class="directing-card"></a>').attr('href', href)
				.append(heroEl(production, 'directing-card-hero'))
				.append($('<div class="operatitle"></div>').text(production.title))
				.append($('<div class="timedate"></div>').text(production.dates));
			$grid.append($card);
		}
		$root.append($grid);
	}

	function renderDetail($root) {
		var production = findProduction(queryId());
		if (!production) {
			window.location.replace('directing-index.html');
			return;
		}
		$root.empty().append(layoutSwitcher('detail'));
		$root.append($('<p class="directing-back"></p>').append(
			$('<a href="directing-index.html"></a>').text('← All productions')
		));
		var group = 'gallery_' + production.id;
		var $block = $('<section class="production-block production-detail"></section>');
		$block.append(heroEl(production, 'production-hero-large'));
		$block.append(headingBlock(production));
		$block.append(creditList(production));
		$block.append(thumbnailStrip(production, group, true));
		$root.append($block);
		bindImageFancybox();
	}

	function renderPopover($root) {
		$root.empty().append(layoutSwitcher('popover'));
		var list = productions();
		for (var i = 0; i < list.length; i++) {
			var production = list[i];
			var $row = $('<div class="directing-compact-row"></div>')
				.append(heroEl(production, 'production-hero-small'))
				.append(
					$('<div class="production-copy"></div>')
						.append($('<div class="operatitle"></div>').text(production.title))
						.append($('<div class="timedate"></div>').text(production.venue + ' — ' + production.dates))
						.append(
							$('<a class="directing-popover-trigger description" href="#"></a>')
								.attr({ 'data-id': production.id })
								.text('Credits & photos')
						)
				);
			$root.append($row);
		}
		bindPopoverFancybox();
	}

	window.renderDirectingPage = function(mode) {
		var $root = $('#directing-root');
		if (!$root.length) {
			return;
		}
		if (mode === 'index') {
			renderIndex($root);
		} else if (mode === 'detail') {
			renderDetail($root);
		} else if (mode === 'popover') {
			renderPopover($root);
		} else {
			renderFull($root);
		}
		schedulePrefetch();
	};
}(window, window.jQuery));
