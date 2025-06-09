export { };

window.addInfo = function (message: string) {
    let li = document.createElement('li');
    li.innerText = message;
    let msgUL = document.getElementsByClassName('infos').item(0) as HTMLUListElement;
    msgUL.appendChild(li);
    setTimeout(() => {
        li.remove();
    }, 3000);
    console.log('added info', message);
}

console.log('gui script loaded');
window.addInfo('window loaded ok');