/*
    1. Render songs
    2. Scroll top
    3. Play / pause /seek
    4. CD rotate
    5. Next / prev
    6. Random
    7. Next / Repeat when ended
    8. Active song
    9. Scroll active song into view
    10. Play song when click
*/

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'THANHTU-PLAYER';

const player = $('.player');
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumbnail');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const iconPause = $('.icon-pause');
const iconPlay = $('.icon-play');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');

const playlist = $('.playlist');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    randomIdList: [],   
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    
    songs: [
        {
            name: 'Hype Boy',
            singer: 'NewJeans',
            path: 'assets/music/HypeBoy.mp3',
            image: 'assets/img/NewJeans.jpg'
        },
        {
            name: 'RUN2U',
            singer: 'STAYC',
            path: 'assets/music/RUN2U.mp3',
            image: 'assets/img/Run2U.jpg'
        },
        {
            name: 'The Feels',
            singer: 'TWICE',
            path: 'assets/music/TheFeels.mp3',
            image: 'assets/img/TheFeels.jpg'
        },
        {
            name: 'Talk That Talk',
            singer: 'TWICE',
            path: 'assets/music/TalkThatTalk.mp3',
            image: 'assets/img/Between12.jpg'
        },
        {
            name: 'Sweet Crazy Love',
            singer: 'ODD EYE CIRCLE',
            path: 'assets/music/SweetCrazyLove.mp3',
            image: 'assets/img/SweetCrazyLove.jpg'
        },
        {
            name: '365247',
            singer: 'DAY6',
            path: 'assets/music/365247.mp3',
            image: 'assets/img/365247.jpg'
        },
        {
            name: 'Eleven',
            singer: 'IVE',
            path: 'assets/music/Eleven.mp3',
            image: 'assets/img/Eleven.jpg'
        },
        {
            name: 'Attention',
            singer: 'NewJeans',
            path: 'assets/music/Attention.mp3',
            image: 'assets/img/NewJeans.jpg'
        },
    ], 

    setConfig: function(key, value){
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    render: function(){
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song" data-index="${index}">
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <div class="title">${song.name}</div>
                        <div class="author">${song.singer}</div>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `;
        });
        playlist.innerHTML = htmls.join('');
    },

    defineProperties: function(){
        Object.defineProperty(this, 'currentSong', {
            get: function(){
                return this.songs[this.currentIndex];
            }
        });
    },

    handleEvents: function(){
        const _this = this; //bi???n t?????ng tr??ng cho app
        const cdWidth = cd.offsetWidth;

        // X??? l?? CD quay v?? d???ng
        const cdThumbAnimate = cdThumb.animate([{
            transform: 'rotate(360deg)'
        }], {
            duration: 10000, //10s
            iterations: Infinity
        })
        cdThumbAnimate.pause();

        //X??? l?? ph??ng to/thu nh??? CD
        document.onscroll = function(){
            const scrollTop = Math.round(document.documentElement.scrollTop);
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        //X??? l?? khi click play
        playBtn.onclick = function(){
            if(_this.isPlaying){
                //n???u t???i ????y g???i this th?? this s??? l?? player, v?? v???y mu???n l???y app ph???i d??ng _this
                audio.pause();
            }
            else{
                audio.play();
            }

            //Khi song ???????c play
            audio.onplay = function(){
                _this.isPlaying = true;
                player.classList.add('playing');
                cdThumbAnimate.play();
            }

            //Khi song b??? d???ng
            audio.onpause = function(){
                _this.isPlaying = false;
                player.classList.remove('playing');
                cdThumbAnimate.pause();
            }

            //Khi ti???n ????? b??i h??t thay ?????i
            audio.ontimeupdate = function(){ 
                if(audio.duration){
                    const progressPercentage = Math.floor(audio.currentTime / audio.duration * 100);
                    progress.value = progressPercentage;
                    _this.loadTime(audio.currentTime, audio.duration);
                }
            }

            //X??? l?? khi tua song (b???ng thanh progress)
            progress.onchange = function(e){
                const seekTime = e.target.value * audio.duration / 100;
                audio.currentTime = seekTime; //set th???i gian ch???y ??ang nh???c l?? seekTime (tua nh???c)
            }
        }

        //X??? l?? khi next song
        nextBtn.onclick = function() {
            if(_this.isRandom){
                _this.playRandomSong();
            }
            else{
                _this.nextSong();
            }
            audio.play();
            _this.scrollToActiveSong();
        }

        //X??? l?? khi prev song
        prevBtn.onclick = function() {
            if(_this.isRandom){
                _this.playRandomSong();
            }
            else{
                _this.prevSong();
            }
            audio.play();
            _this.scrollToActiveSong();
        }

        //X??? l?? khi random song
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
        }

        //X??? l?? l???p l???i 1 song
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        //X??? l?? next song khi audio ended
        audio.onended = function(){
            if(_this.isRepeat){
                audio.play();
            }
            else{
                nextBtn.click();
            }
        }

        //L???ng nghe h??nh vi click v??o playlist
        playlist.onclick = function(e){
            const songNode = e.target.closest('.song:not(.active)'); 
            if(songNode || e.target.closest('.option')){
                //X??? l?? khi click v??o song
                if(songNode){
                    _this.currentIndex = Number(songNode.dataset.index); //truy c???p t???i data-* th??ng qua thu???c t??nh dataset
                    _this.loadCurrentSong();
                    _this.loadActiveState();
                    audio.play();
                }
            }
        }
    },

    loadCurrentSong: function(){
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },

    loadTime: function(currentTime, duration){
        $('.currentAudioTime').innerHTML = this.timeCountUp(currentTime);
        $('.totalTimeLeft').innerHTML = this.timeCountDown(currentTime, duration);
    },

    timeCountUp: function(currentTime){
        var min = parseInt((currentTime / 60) % 60);
        var sec = parseInt(currentTime % 60);
        if (sec < 10) {
            return min + ":0"+ sec;
        }
        else {
            return min + ":"+ sec;
        }
    },
    timeCountDown: function(currentTime, duration){
        duration = parseInt(duration);
        currentTime = parseInt(currentTime);
        var timeLeft = duration - currentTime, sec, min;
        
        sec = timeLeft % 60;
        min = Math.floor(timeLeft / 60) % 60;
        
        sec = sec < 10 ? "0" + sec : sec;
        min = min < 10 ? "0" + min : min;
        
        return min + ":" + sec;
    },

    loadActiveState: function(){
        const songList = $$('.song');
        songList.forEach(song => {
            song.classList.remove('active');
        });
        songList[this.currentIndex].classList.add('active');
    },

    loadConfig: function(){
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    scrollToActiveSong: function(){
        const block = this.currentIndex < 4 ? "end" : "nearest";
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block : block
            });
        }, 300);
    },

    nextSong: function(){
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
        this.loadActiveState();
    },
    prevSong: function(){
        if(this.currentIndex == 0){
            this.currentIndex = this.songs.length;
        }
        this.currentIndex--;
        this.loadCurrentSong();
        this.loadActiveState();
    },
    playRandomSong: function(){
        const randomIdList = this.randomIdList;
        if(randomIdList.length == this.songs.length){
            do {
                randomIdList.pop();
            } while (randomIdList.length > 0);
        }
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex || randomIdList.includes(newIndex));
        this.currentIndex = newIndex;
        randomIdList.push(this.currentIndex);
        this.loadCurrentSong();
        this.loadActiveState();
    },

    start: function(){
        //G??n c???u h??nh t??? config v??o ???ng d???ng
        this.loadConfig();
        
        //?????nh ngh??a c??c thu???c t??nh cho object
        this.defineProperties();

        //L???ng nghe & x??? l?? c??c s??? ki???n (DOM Events)
        this.handleEvents();

        //T???i th??ng tin b??i h??t hi???n t???i v??o UI khi ch???y ???ng d???ng
        this.loadCurrentSong();

        //Render playlist
        this.render();
        
        //Load tr???ng th??i active cho song
        this.loadActiveState();

        //Hi???n th??? tr???ng th??i ban ?????u c???a repeatBtn v?? RandomBtn
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat)

    }
}

app.start();
