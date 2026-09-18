// Focus the child browsing context as well as its iframe element. This does
// not read cross-origin content, forward keys, or change gateway permissions.
export function focusRemoteWindow(frame){
 if(!frame?.isConnected||!frame.getClientRects().length)return false;
 frame.focus({preventScroll:true});
 try{frame.contentWindow?.focus();}catch{}
 return true;
}
export function watchRemoteFocus(frame,onFocus){
 const receive=()=>{if(document.activeElement===frame){onFocus();try{frame.contentWindow?.focus();}catch{}}};
 const blur=()=>setTimeout(receive,0);
 frame.addEventListener('focus',onFocus);
 window.addEventListener('blur',blur);
 return ()=>{frame.removeEventListener('focus',onFocus);window.removeEventListener('blur',blur);};
}
