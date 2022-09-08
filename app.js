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
    // config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    
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

    // setConfig: function(key, value){
    //     this.config[key] = value;
    //     localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    // },

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
        const _this = this; //biến tượng trưng cho app
        const cdWidth = cd.offsetWidth;

        // Xử lý CD quay và dừng
        const cdThumbAnimate = cdThumb.animate([{
            transform: 'rotate(360deg)'
        }], {
            duration: 10000, //10s
            iterations: Infinity
        })
        cdThumbAnimate.pause();

        //Xử lý phóng to/thu nhỏ CD
        document.onscroll = function(){
            const scrollTop = Math.round(document.documentElement.scrollTop);
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        //Xử lý khi click play
        playBtn.onclick = function(){
            if(_this.isPlaying){
                //nếu tại đây gọi this thì this sẽ là player, vì vậy muốn lấy app phải dùng _this
                audio.pause();
            }
            else{
                audio.play();
            }

            //Khi song được play
            audio.onplay = function(){
                _this.isPlaying = true;
                player.classList.add('playing');
                cdThumbAnimate.play();
            }

            //Khi song bị dừng
            audio.onpause = function(){
                _this.isPlaying = false;
                player.classList.remove('playing');
                cdThumbAnimate.pause();
            }

            //Khi tiến độ bài hát thay đổi
            audio.ontimeupdate = function(){ 
                if(audio.duration){
                    const progressPercentage = Math.floor(audio.currentTime / audio.duration * 100);
                    progress.value = progressPercentage;
                }
            }

            //Xử lý khi tua song (bằng thanh progress)
            progress.onchange = function(e){
                const seekTime = e.target.value * audio.duration / 100;
                audio.currentTime = seekTime; //set thời gian chạy đang nhạc là seekTime (tua nhạc)
            }
        }

        //Xử lý khi next song
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

        //Xử lý khi prev song
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

        //Xử lý khi random song
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom;
            // _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
        }

        //Xử lý lặp lại 1 song
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat;
            // _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        //Xử lý next song khi audio ended
        audio.onended = function(){
            if(_this.isRepeat){
                audio.play();
            }
            else{
                nextBtn.click();
            }
        }

        //Lắng nghe hành vi click vào playlist
        playlist.onclick = function(e){
            const songNode = e.target.closest('.song:not(.active)'); 
            if(songNode || e.target.closest('.option')){
                //Xử lý khi click vào song
                if(songNode){
                    _this.currentIndex = Number(songNode.dataset.index); //truy cập tới data-* thông qua thuộc tính dataset
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

    loadActiveState: function(){
        const songList = $$('.song');
        songList.forEach(song => {
            song.classList.remove('active');
        });
        songList[this.currentIndex].classList.add('active');
    },

    // loadConfig: function(){
    //     this.isRandom = this.config.isRandom;
    //     this.isRepeat = this.config.isRepeat;
    // },

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
        //Định nghĩa các thuộc tính cho object
        this.defineProperties();

        //Lắng nghe & xử lý các sự kiện (DOM Events)
        this.handleEvents();

        //Tải thông tin bài hát hiện tại vào UI khi chạy ứng dụng
        this.loadCurrentSong();

        //Render playlist
        this.render();
        
        //Load trạng thái active cho song
        this.loadActiveState();
    }
}

app.start();
