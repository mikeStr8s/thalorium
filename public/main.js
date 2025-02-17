const CURRENT_PATH = window.location.pathname;

/**
 * Filetree client side
 */
const $filetree = $('#filetree');
const $filetree_openers = $filetree.children('li').find('.opener');

$filetree_openers.each((i, element) => {
    let $this = $(element);
    $this.on('click', (event) => {
        event.preventDefault();

        $filetree_openers.not($this).removeClass('active');
        $this.toggleClass('active');
    });
});

const $filetree_links = $('ul li a');
$filetree_links.each((i, element) => {
    const $element = $(element);
    if (CURRENT_PATH === $element.attr('href')) {
        $element.closest('ul').prev('span.opener').addClass('active');
        $element.addClass('active');
    }
});

/**
 * Toggle sidebar
 */
const $sidebar = $('#sidebar');
const $toggle = $('.toggle');

$toggle.each((i, toggle) => {
    toggle.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();

        toggle.classList.toggle('inactive');
        $sidebar.toggleClass('inactive');
    }
});