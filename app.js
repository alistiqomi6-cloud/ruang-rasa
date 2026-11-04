const particleCanvas=document.querySelector("#particleCanvas");
if (!particleCanvas) {
    console.error("Canvas partikel tidak ditemukan!");
} else {
    console.log("Canvas partikel berhasil ditemukan!");
}
const particleCtx=particleCanvas.getContext("2d");
let particles=[];
let canvasWidth=window.innerWidth;
let canvasHeight=window.innerHeight;
const particleCount=75;
function resizeParticleCanvas(){
    const pixelRatio=Math.min(
        window.devicePixelRatio||1,
        1.5
    );
    canvasWidth=window.innerWidth;
    canvasHeight=window.innerHeight;
    particleCanvas.width=canvasWidth*pixelRatio;
    particleCanvas.height=canvasHeight*pixelRatio;
    particleCtx.setTransform(
        pixelRatio,0,
        0,pixelRatio,
        0,0
    );
}
function createParticles(){
    particles=[];
    for(let i=0;i<particleCount;i++){
        particles.push({
            x:Math.random()*canvasWidth,
            y:Math.random()*canvasHeight,
            size:Math.random()*2+0.5,
            speedX:(Math.random()-0.5)*0.3,
            speedY:Math.random()*-0.35-0.08,
            opacity:Math.random()*0.5+0.2,
            twinkle:Math.random()*0.02+0.0005,
            phase:Math.random()*Math.PI*2
        });
    }
}
function drawParticles(){
    particleCtx.clearRect(
        0,
        0,
        canvasWidth,
        canvasHeight
    );
    particles.forEach(function(particle){
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.phase += particle.twinkle;
        const glow=Math.sin(particle.phase);
        const alpha=
        particle.opacity*(0.65+glow*0.35);
        if(particle.y<-10){
            particle.y=canvasHeight+10;
            particle.x=Math.random()*canvasWidth;
        }
        if(particle.x<-10){
            particle.x=canvasWidth+10;
        }
        if(particle.x>canvasWidth+10){
            particle.x=-10;
        }
        particleCtx.beginPath();
        particleCtx.arc(
            particle.x,
            particle.y,
            particle.size,
            0,
            Math.PI*2
        );
        particleCtx.fillStyle=
        `rgba(216,197,240,${alpha})`;
        particleCtx.shadowBlur=12;
        particleCtx.shadowColor="#A98BD4";
        particleCtx.fill();
    });
    particleCtx.shadowBlur=0;
    requestAnimationFrame(drawParticles);
}
resizeParticleCanvas();
createParticles();
drawParticles();
window.addEventListener("resize",function(){
    resizeParticleCanvas();
    createParticles();
});
const loader=document.querySelector(".loader");
const loaderNumber=document.querySelector(".loader-number");
const loaderBar=document.querySelector(".loader-bar span");
let progress=0;
const loading=setInterval(()=>{
    progress++;
    loaderBar.style.width=progress+"%";
    loaderNumber.textContent=progress+"%";
    if(progress>=100){
        clearInterval(loading);
        loader.classList.add("loaded");
        document.querySelector(".navbar").classList.add("show");
    }
}, 50);

const moodButtons=document.querySelectorAll("[data-mood]");
const saveMoodButton=document.querySelector("#saveMoodButton");
const moodHistoryList=document.querySelector("#moodHistoryList");
const moodFeedback=document.querySelector("#moodFeedback");
let selectedMood=null;
let moodHistory=JSON.parse(
    localStorage.getItem("ruangRasaMoodHistory")||"[]"
);
moodButtons.forEach(function(button){
    button.addEventListener("click",function(){
        selectedMood=button.dataset.mood;
        moodButtons.forEach(function(item){
            item.classList.remove("is-selected");
            item.setAttribute("aria-pressed","false");
        });
        button.classList.add("is-selected");
        button.setAttribute("aria-pressed","true");
        moodFeedback.textContent=
        "Mood yang dipilih: "+selectedMood;
    });
});
function saveMoodHistory(){
    localStorage.setItem(
        "ruangRasaMoodHistory",
        JSON.stringify(moodHistory)
    );
}

function renderMoodHistory() {
    moodHistoryList.replaceChildren();

    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;

    const recentMoods = moodHistory
        .filter(function (entry) {
            const moodTime = new Date(entry.date).getTime();

            return (
                Number.isFinite(moodTime) &&
                moodTime <= now &&
                now - moodTime < thirtyDays
            );
        })
        .sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
        });

    if (recentMoods.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent =
            "Belum ada catatan mood dalam 30 hari terakhir.";

        moodHistoryList.appendChild(emptyMessage);
        return;
    }

    recentMoods.forEach(function (entry) {
        const card = document.createElement("article");
        card.className = "mood-history-item";

        const moodTitle = document.createElement("h3");
        moodTitle.textContent = entry.emoji + " " + entry.mood;

        const moodDate = document.createElement("p");
        moodDate.textContent = new Date(entry.date).toLocaleString(
            "id-ID",
            {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

        // Tombol hapus untuk setiap catatan
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-mood-button";
        deleteButton.textContent = "Hapus";

        deleteButton.addEventListener("click", function () {
            const confirmed = confirm(
                "Yakin ingin menghapus catatan mood ini?"
            );

            if (!confirmed) return;

            // Hapus catatan yang tanggal dan mood-nya cocok
            const index = moodHistory.findIndex(function (item) {
                return item === entry;
            });

            if (index === -1) return;

            moodHistory.splice(index, 1);

            // Simpan perubahan ke browser
            saveMoodHistory();

            // Perbarui tampilan
            renderMoodHistory();
        });

        card.append(moodTitle, moodDate, deleteButton);
        moodHistoryList.appendChild(card);
    });
}
saveMoodButton.addEventListener("click",function(){
    if(!selectedMood){
        moodFeedback.textContent=
        "Pilih suasana hati terlebih dahulu sebelum menyimpan";
        return;
    }
    const emojis = {
        Senang: "😊",
        Tenang: "😌",
        Sedih: "😔",
        Cemas: "😟",
        Marah: "😠",
        Lelah: "😮‍💨"
    };
    const newMood={
        mood:selectedMood,
        emoji:emojis[selectedMood],
        date:new Date().toISOString()
    };
    moodHistory.unshift(newMood);
    saveMoodHistory();
    renderMoodHistory();
    moodFeedback.textContent=
    "Mood berhasil disimpan ke mood history!";
    selectedMood=null;
    moodButtons.forEach(function(button){
        button.classList.remove("is-selected");
        button.setAttribute("aria-pressed","false");
    });
});
renderMoodHistory();
const journalForm=document.querySelector("#journalForm");
const journalInput=document.querySelector("#journalInput");
const latestJournal=document.querySelector("#latestJournal");
const journalFeedback=document.querySelector("#journalFeedback");
let journalEntries=JSON.parse(
    localStorage.getItem("ruangRasaJournals")||"[]"
);
function saveJournals(){
    localStorage.setItem(
        "ruangRasaJournals",
        JSON.stringify(journalEntries)
    );
}
function renderJournals() {
    // Bersihkan tampilan jurnal sebelumnya
    latestJournal.replaceChildren();
    // Jika belum ada jurnal
    if (journalEntries.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent =
            "Belum ada jurnal. Mulailah menulis ceritamu.";
        latestJournal.appendChild(emptyMessage);
        return;
    }
    // Urutkan jurnal terbaru di bagian paling atas
    journalEntries.forEach(function(entry) {
        const journalCard = document.createElement("article");
        journalCard.className = "journal-card";
        // Tanggal jurnal
        const journalDate = document.createElement("p");
        journalDate.className = "journal-date";
        journalDate.textContent = new Date(
            entry.date
        ).toLocaleString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
        // Isi jurnal
        const journalText = document.createElement("p");
        journalText.className = "journal-text";
        journalText.textContent = entry.content;
        // Tombol hapus
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-journal-button";
        deleteButton.textContent = "Hapus Jurnal";
        // Ketika tombol hapus ditekan
        deleteButton.addEventListener("click", function() {
            const confirmed = confirm(
                "Apakah kamu yakin ingin menghapus jurnal ini?"
            );
            if (!confirmed) return;
            // Cari jurnal yang dipilih
            const index = journalEntries.findIndex(function(item) {
                return item === entry;
            });
            if (index === -1) return;
            // Hapus jurnal dari array
            journalEntries.splice(index, 1);
            // Simpan perubahan ke localStorage
            saveJournals();
            // Perbarui tampilan jurnal
            renderJournals();
        });
        // Masukkan elemen ke kartu
        journalCard.append(
            journalDate,
            journalText,
            deleteButton
        );
        latestJournal.appendChild(journalCard);
    });
}
renderJournals();
// ==================================
// SAVE JOURNAL
// ==================================
journalForm.addEventListener("submit", function(event) {
    // Mencegah halaman refresh
    event.preventDefault();
    // Mengambil tulisan pengguna
    const content = journalInput.value.trim();
    // Memeriksa tulisan kosong
    if (content === "") {
        journalFeedback.textContent =
            "Tuliskan sesuatu terlebih dahulu.";
        return;
    }
    // Membuat jurnal baru
    const newJournal = {
        content: content,
        date: new Date().toISOString()
    };
    // Menambahkan jurnal ke array
    journalEntries.unshift(newJournal);
    // Menyimpan ke localStorage
    saveJournals();
    // Memperbarui tampilan
    renderJournals();
    // Mengosongkan textarea
    journalInput.value = "";
    // Memberikan pesan
    journalFeedback.textContent =
        "Jurnal berhasil disimpan!";
});
const breathingCircle=document.querySelector("#breathingCircle");
const breathingText=document.querySelector("#breathingText");
const breathingInstruction=document.querySelector("#breathingInstruction");
const breathingButton=document.querySelector("#breathingButton");
let breathingInterval=null;
let breathingPhase=0;
let isBreathing=false;
const breathingSteps=[
    {
        text:"tarik napas",
        instruction:"tarik napas perlahan...",
        className:"inhale",
        duration:4000
    },
    {
        text:"hembuskan",
        instruction:"hembuskan napas perlahan...",
        className:"exhale",
        duration:8000
    }
];
function runBreathing(){
    const step=breathingSteps[breathingPhase];
    breathingCircle.classList.remove("inhale","exhale");
    void breathingCircle.offsetWidth;
    breathingCircle.classList.add(step.className);
    breathingText.textContent=step.text;
    breathingInstruction.textContent=step.instruction;
    breathingPhase=(breathingPhase+1)%breathingSteps.length;
    breathingInterval=setTimeout(
        runBreathing,
        step.duration
    );
}
breathingButton.addEventListener("click",function(){
    if(!isBreathing){
        isBreathing=true;
        breathingPhase=0;
        breathingButton.textContent="berhenti";
        runBreathing();
    }else{
        clearTimeout(breathingInterval);
        isBreathing=false;
        breathingCircle.classList.remove("inhale","exhale");
        breathingText.textContent="ready?";
        breathingInstruction.textContent="kamu bisa beristirahat sejenak";
        breathingButton.textContent="mulai";
    }
});
const educationButtons = document.querySelectorAll(
    "[data-education]"
);
const educationDetail = document.querySelector(
    "#educationDetail"
);
const educationCategory = document.querySelector(
    "#educationCategory"
);
const educationTitle = document.querySelector(
    "#educationTitle"
);
const educationContent = document.querySelector(
    "#educationContent"
);
const closeEducation = document.querySelector(
    "#closeEducation"
);
// DATA MATERI
const educationMaterials = {
    emotions: {
        category: "EMOTIONAL AWARENESS",
        title: "Mengenal Emosi",
        content: `
            <p>
                Emosi adalah respons yang muncul ketika kita
                mengalami suatu kejadian, mengingat sesuatu,
                atau menghadapi situasi tertentu.
            </p>
            <h4>Jenis-jenis Emosi</h4>
            <p><strong>Bahagia:</strong> Perasaan positif yang
            dapat muncul ketika mengalami sesuatu yang menyenangkan.</p>
            <p><strong>Sedih:</strong> Perasaan yang dapat muncul
            ketika mengalami kehilangan atau kekecewaan.</p>
            <p><strong>Marah:</strong> Respons emosional yang
            dapat muncul ketika merasa terganggu atau diperlakukan
            tidak adil.</p>
            <p><strong>Takut:</strong> Perasaan yang muncul ketika
            menghadapi sesuatu yang dianggap mengancam.</p>
            <h4>Hal yang Perlu Diingat</h4>
            <p>
                Tidak ada emosi yang perlu dianggap memalukan.
                Mengenali perasaan adalah langkah awal untuk
                memahami kebutuhan diri.
            </p>
        `
    },
    management: {
        category: "EMOTIONAL SKILLS",
        title: "Mengelola Emosi",
        content: `
            <p>
                Mengelola emosi bukan berarti menghilangkan
                perasaan. Artinya, kita belajar memahami
                perasaan dan memilih respons yang tepat.
            </p>
            <h4>Cara Mengelola Emosi</h4>
            <p><strong>1. Kenali perasaanmu.</strong>
            Cobalah memberi nama pada emosi yang sedang dirasakan.</p>
            <p><strong>2. Berikan jeda.</strong>
            Ambil waktu sebelum merespons situasi yang membuatmu
            kesal atau kecewa.</p>
            <p><strong>3. Ungkapkan dengan sehat.</strong>
            Kamu dapat menulis jurnal atau berbicara dengan
            orang yang kamu percaya.</p>
            <p><strong>4. Cari dukungan.</strong>
            Tidak semua hal harus kamu hadapi sendirian.</p>
        `
    },
    awareness: {
        category: "SELF AWARENESS",
        title: "Mengenal Diri",
        content: `
            <p>
                Self awareness atau kesadaran diri adalah
                kemampuan memahami perasaan, pikiran,
                kebiasaan, dan respons diri sendiri.
            </p>
            <h4>Pertanyaan untuk Mengenal Diri</h4>
            <p>• Apa yang sedang aku rasakan?</p>
            <p>• Apa yang membuatku merasa seperti ini?</p>
            <p>• Apa yang sebenarnya aku butuhkan?</p>
            <p>• Apa yang bisa aku lakukan untuk diriku hari ini?</p>
            <h4>Latihan Sederhana</h4>
            <p>
                Luangkan beberapa menit setiap hari untuk
                menuliskan perasaan dan pengalamanmu.
                Kamu bisa menggunakan fitur Journal di Ruang Rasa.
            </p>
        `
    },
    compassion: {
        category: "SELF COMPASSION",
        title: "Menyayangi Diri",
        content: `
            <p>
                Self compassion berarti memperlakukan diri
                dengan pengertian ketika menghadapi kesalahan,
                kegagalan, atau masa sulit.
            </p>
            <h4>Bagaimana Melakukannya?</h4>
            <p><strong>1. Terima bahwa kamu bisa melakukan kesalahan.</strong>
            Kesalahan merupakan bagian dari proses belajar.</p>
            <p><strong>2. Gunakan kata-kata yang baik.</strong>
            Cobalah berbicara kepada diri sendiri seperti
            kamu berbicara kepada seorang teman.</p>
            <p><strong>3. Hargai proses.</strong>
            Perkembangan tidak selalu harus berlangsung cepat.</p>
            <p><strong>4. Berikan waktu untuk beristirahat.</strong>
            Kebutuhan untuk beristirahat juga penting.</p>
        `
    },
    mentalHealth: {
        category: "MENTAL HEALTH",
        title: "Kesehatan Mental",
        content:`
        <p>
            Kesehatan mental adalah kondisi emosional, psikologis, dan sosial yang memengaruhi cara kita berpikir, merasa, dan bertindak. Memiliki kesehatan mental yang baik penting untuk hidup yang seimbang dan berkualitas.
        </p>
        <h4>Cara Menjaga Kesehatan Mental</h4>
        <p><strong>1. Tetap aktif secara fisik.</strong>
        Olahraga dapat membantu mengurangi stres dan meningkatkan suasana hati.</p>
        <p><strong>2. Jaga pola tidur yang baik.</strong>
        Tidur yang cukup membantu tubuh dan pikiran pulih.</p>
        <p><strong>3. Bangun hubungan sosial yang positif.</strong>
        Berinteraksi dengan orang yang mendukung dapat meningkatkan kesejahteraan emosional.</p>
        <p><strong>4. Luangkan waktu untuk diri sendiri.</strong>
        Melakukan hobi atau aktivitas yang disukai dapat membantu mengurangi stres.</p>
        <p><strong>5. Jangan ragu untuk mencari bantuan profesional.</strong>
        Jika merasa kewalahan, berbicara dengan psikolog atau konselor dapat sangat membantu.</p>
        `
    }
};
// KLIK TOMBOL PELAJARI
educationButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        const materialName = button.dataset.education;
        const material = educationMaterials[materialName];
        if (!material) return;
        educationCategory.textContent = material.category;
        educationTitle.textContent = material.title;
        educationContent.innerHTML = material.content;
        educationDetail.hidden = false;
        educationDetail.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
});
// TOMBOL TUTUP
closeEducation.addEventListener("click", function() {
    educationDetail.hidden = true;
});
const menuToggle = document.querySelector("#menuToggle");
const navLinks = document.querySelector("#navLinks");
// BUKA DAN TUTUP MENU
menuToggle.addEventListener("click", function() {
    const isOpen = navLinks.classList.toggle("show");
    menuToggle.classList.toggle("active", isOpen);
    menuToggle.setAttribute(
        "aria-expanded",
        isOpen
    );
});
// TUTUP MENU SETELAH LINK DIKLIK
navLinks.querySelectorAll("a").forEach(function(link) {
    link.addEventListener("click", function() {
        navLinks.classList.remove("show");
        menuToggle.classList.remove("active");
        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );
    });
});
// TUTUP MENU JIKA KLIK DI LUAR NAVBAR
document.addEventListener("click", function(event) {
    if (!event.target.closest(".navbar")) {
        navLinks.classList.remove("show");
        menuToggle.classList.remove("active");
        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );
    }
});
/* ==============================
   NAVBAR ACTIVE ON SCROLL
============================== */
const pageSections = document.querySelectorAll(
    "#homepage, #mood-history, #journal, #mood-check, #ruang-tenang, #edukasi"
);
const pageNavLinks = document.querySelectorAll(
    ".nav-links a"
);
// MENGUBAH MENU AKTIF
function updateActiveNavigation() {
    let currentSection = "";
    pageSections.forEach(function(section) {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const scrollPosition = window.scrollY + 150;
        if (
            scrollPosition >= sectionTop &&
            scrollPosition < sectionTop + sectionHeight
        ) {
            currentSection = section.id;
        }
    });
    // MEMBERIKAN CLASS ACTIVE
    pageNavLinks.forEach(function(link) {
        link.classList.remove("active");
        if (
            link.getAttribute("href") === "#" + currentSection
        ) {
            link.classList.add("active");
        }
    });
}
// JALANKAN KETIKA SCROLL
window.addEventListener(
    "scroll",
    updateActiveNavigation
);
// JALANKAN SAAT HALAMAN DIBUKA
window.addEventListener(
    "load",
    updateActiveNavigation
);