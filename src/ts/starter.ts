
window.wsURL ||= location.href + "ws"



function connectWS() {
    console.log('connecting the web socket');
    let id = localStorage.getItem('identifier');
    if (!id) {
        const bytes = new Uint8Array(30);
        crypto.getRandomValues(bytes);
        id = btoa(String.fromCharCode(...bytes));
        localStorage.setItem('identifier', id);
    }
    let ws = new WebSocket(window.wsURL);
    ws.onopen = (event) => {
        window.addInfo('websocket connected');
        window.ws = ws;
        ws.send(id)
        document.getElementById('aliveClock').innerText = 'online';
    }
    ws.onerror = (event) => {
        console.log(event);
    }
    ws.onclose = (event) => {
        window.addInfo('websocket closed');
        setTimeout(() => {
            connectWS();
        }, 5000);
        document.getElementById('aliveClock').innerText = 'offline';
    }
    ws.onmessage = gotMessage;
}


async function gotMessage(event) {
    let data = event.data as string;
    data = data.trim();
    if (data[0] == '<') {
        console.log('got html', data);
        // create an unattached element
        const div = document.createElement('div');
        // parses html but also drops tags that are not proper in this structure like tr without a table-parent
        div.innerHTML = data;
        const allActions = div.querySelectorAll("[x-action]");
        // go through those with actions
        for (const n of Array.from(allActions)) {
            let attr = n.getAttribute('x-action');
            var sameId: HTMLElement | null = null;
            if (n.id) {
                // for replacements/deletes
                sameId = document.getElementById(n.id);
            }
            var oid = '';
            var otherId = document.body;
            if (n.hasAttribute('x-id')) {
                // for related elements
                oid = n.getAttribute('x-id') || '';
                otherId = document.getElementById(oid) || otherId;
            }
            switch (attr) {
                case 'after':
                    otherId.after(n);
                    break;
                case 'append':
                    otherId.append(n);
                    break;
                case 'before':
                    otherId.before(n);
                    break;
                case 'prepend':
                    otherId.prepend(n);
                    break;
                case 'remove':
                    if (sameId != null)
                        sameId.remove();
                    else
                        console.log(`element ${n.id} was not found`);
                    break;
                case 'replace':
                    if (sameId != null)
                        sameId.replaceWith(n);
                    else
                        if (otherId != null)
                            otherId.append(n);
                        else
                            if (oid == 'head')
                                document.head.appendChild(n);
                            else
                                document.body.appendChild(n);
                    break;
                default:
                    console.log('had no action defined for ', n);
            }
            if (n.tagName == 'DIALOG' && attr != 'remove') {
                (n as HTMLDialogElement).showModal();
            } else {
                setTimeout(() => {
                    n.classList.add('showUp');
                    n.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest"
                    });
                    setTimeout(() => {

                        let ne = n as HTMLElement;
                        let focus_el = ne.getElementsByClassName('focus').item(0) as (HTMLElement | null);
                        if (focus_el) {
                            focus_el.focus();
                        }
                    }, 100);
                }, 100);
            }
        }

    } else {
        console.log('got text', data);
        let json = JSON.parse(data);
        if (json instanceof Array) {
            let arr = json as string[];
            let m = window[arr[0]];
            if (m) {
                try {
                    console.log('calling', arr[0], arr.slice(1));
                    let r = m(...arr.slice(1));
                    if (r instanceof Promise) {
                        window.addInfo(`waiting for ${data}`);
                        await r;
                    }
                } catch (e) {
                    console.error(e);
                    window.addError(`error in ${data}: ${e}`);
                }
            } else {
                console.log(`no handler for ${data}`);
            }

        } else {
            window.addError(`got json ${json}`);
        }
    }
}


console.log('starter loaded');
import('./gui.js').then(async () => {
    connectWS();
});