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