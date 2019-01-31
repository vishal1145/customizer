/**
 * Load the twitter features in the background.
 *
 */
(<any>window).twttr = (function (d, s, id) {
    let js;
    const fjs = d.getElementsByTagName(s)[0],
        t = (<any>window).twttr || {};
    if (d.getElementById(id)) {
        return t;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = 'https://platform.twitter.com/widgets.js';
    fjs.parentNode.insertBefore(js, fjs);

    t._e = [];
    t.ready = function (f) {
        t._e.push(f);
    };

    return t;
}(document, 'script', 'twitter-wjs'));


// FIXME @7frank the twitter share url should be an array where the first link is a gif file the second is the url of the server to visit.
// http://invision3d.org:3000/images/e353e8bc-a3b9-4163-811b-616a575b6148.gif
// #pewpew hello world http://invision3d.org:3000/api/share/1c93d5cc-ffc8-4a76-9b46-e8f99e545db8

/**
 * @deprecated
 * @param el
 * @param text
 * @param hashtags
 * @param shareURLs
 */
export function updateTwitterShareButton(el: HTMLAnchorElement, text: string, hashtags: Array<string>, shareURLs: Array<string>) {

    const tags = hashtags.map((tag) => '#' + tag).join(' ');
    const urls = shareURLs.join(' ');

    const message = `${text} ${tags} ${urls}`;

    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
    el.href = url;
}
