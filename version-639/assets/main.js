(function(){
var qs=function(s,c){return(c||document).querySelector(s)};
var qsa=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
var toggle=qs('[data-menu-toggle]'),mobile=qs('[data-mobile-menu]');
if(toggle&&mobile){toggle.addEventListener('click',function(){mobile.classList.toggle('is-open')})}
var slides=qsa('.hero-slide'),dots=qsa('.hero-dots button'),active=0;
function showSlide(n){if(!slides.length)return;active=(n+slides.length)%slides.length;slides.forEach(function(el,i){el.classList.toggle('is-active',i===active)});dots.forEach(function(el,i){el.classList.toggle('is-active',i===active)})}
if(slides.length){dots.forEach(function(el,i){el.addEventListener('click',function(){showSlide(i)})});setInterval(function(){showSlide(active+1)},5200)}
var inputs=qsa('[data-search-input]'),filters=qsa('[data-filter]'),current='全部';
function valueOfInputs(){var v='';inputs.forEach(function(input){if(input.value.trim())v=input.value.trim().toLowerCase()});return v}
function filterCards(){var kw=valueOfInputs(),cards=qsa('[data-card]'),shown=0;cards.forEach(function(card){var text=((card.dataset.title||'')+' '+(card.dataset.year||'')+' '+(card.dataset.type||'')+' '+(card.dataset.genre||'')+' '+(card.dataset.tags||'')).toLowerCase();var okKw=!kw||text.indexOf(kw)>-1;var okFilter=current==='全部'||text.indexOf(current.toLowerCase())>-1;var ok=okKw&&okFilter;card.style.display=ok?'':'none';if(ok)shown++});qsa('[data-empty]').forEach(function(el){el.classList.toggle('is-visible',shown===0)})}
inputs.forEach(function(input){input.addEventListener('input',filterCards)});
filters.forEach(function(btn){btn.addEventListener('click',function(){current=btn.getAttribute('data-filter')||'全部';filters.forEach(function(b){b.classList.remove('is-active')});btn.classList.add('is-active');filterCards()})});
var player=qs('[data-player]');
if(player){var video=qs('[data-video]',player),play=qs('[data-play]',player),stream=player.getAttribute('data-stream'),ready=false,hlsInstance=null;function attach(){if(ready||!video||!stream)return;ready=true;if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=stream}else if(window.Hls&&window.Hls.isSupported()){hlsInstance=new Hls({enableWorker:true});hlsInstance.loadSource(stream);hlsInstance.attachMedia(video)}else{video.src=stream}}function start(){attach();if(play)play.classList.add('is-hidden');var p=video.play();if(p&&p.catch)p.catch(function(){})}if(play)play.addEventListener('click',start);if(video)video.addEventListener('click',function(){if(video.paused)start()})}
})();