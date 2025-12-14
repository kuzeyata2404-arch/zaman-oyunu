// --- OYUN VERİLERİ ---
const MAKS_TUR = 5;
let oyunDurumu = {
    tur: 1,
    risk: 0, // Paradoks Riski (0 - 100)
    artefaktlar: [],
    mesaj: "Hoş geldiniz, Zaman Ajanı. Göreviniz başladı.",
    oyunBitti: false
};

const ZAMAN_DURAKLARI = {
    1: {
        baslik: "M.Ö. 48 - İskenderiye Kütüphanesi",
        gorev: "Kütüphane alevler içinde. Hangi eylemi seçerek felaketi en aza indireceksin?",
        secenekler: [
            { metin: "A) Yangını söndürmeye odaklan (Fiziksel Güç)", risk: 10, artefakt: null, etki: "Büyük kütüphanenin yarısı kurtarıldı." },
            { metin: "B) En önemli parşömenleri güvenli zamana taşı (Teknolojik Risk)", risk: 25, artefakt: "Eski Parşömen", etki: "Gelecek bilginin hızını artırma riski." },
            { metin: "C) Hiçbir şey yapma, tarihin akışına izin ver (Gözlem)", risk: -5, artefakt: null, etki: "Paradoks riski azaldı, ancak görev başarısız." }
        ]
    },
    2: {
        baslik: "1912 - Titanik'in Batışı",
        gorev: "Gelecekte önemli bir rol oynayacak bilim insanı Marie’yi kurtar. Botlar yetersiz.",
        secenekler: [
            { metin: "A) Kendi kronos ekipmanını feda et ve bir bot yeri aç (Yüksek Fedakarlık)", risk: -10, artefakt: null, etki: "Risk azaldı. Marie güvende." },
            { metin: "B) Kaptan Smith'e gelecekteki kötü sonunu fısılda ve onu uyar (Büyük Paradoks Riski)", risk: 40, artefakt: null, etki: "Denizcilik tarihi tamamen değişebilir!" },
            { metin: "C) Marie’yi kurtar, karşılığında değerli bir nesne al (Ticaret)", risk: 5, artefakt: "Marie'nin Kolyesi", etki: "Artefakt alındı." }
        ]
    },
    // Tur 3+ eklenebilir...
};

// --- FONKSİYONLAR ---

function oyunuYukle() {
    const kaydedilenDurum = localStorage.getItem('kronos_paradoksu');
    if (kaydedilenDurum) {
        oyunDurumu = JSON.parse(kaydedilenDurum);
    } else {
        oyunuSifirla(false);
    }
    ekraniGuncelle();
}

function oyunuKaydet() {
    localStorage.setItem('kronos_paradoksu', JSON.stringify(oyunDurumu));
}

function ekraniGuncelle() {
    const mevcutDurak = ZAMAN_DURAKLARI[oyunDurumu.tur];
    
    document.getElementById('tur-baslik').innerText = mevcutDurak.baslik;
    document.getElementById('tur-gorev').innerText = mevcutDurak.gorev;
    document.getElementById('risk-durumu').innerText = `Paradoks Riski: ${oyunDurumu.risk}%`;
    document.getElementById('artefakt-listesi').innerText = `Artefaktlar: ${oyunDurumu.artefaktlar.join(', ') || 'Yok'}`;
    document.getElementById('mesaj-kutusu').innerText = oyunDurumu.mesaj;

    const seceneklerDOM = document.getElementById('secenekler');
    seceneklerDOM.innerHTML = '';
    
    if (oyunDurumu.oyunBitti) {
        seceneklerDOM.innerHTML = `<h2>Oyun Bitti! Nihai Risk: ${oyunDurumu.risk}%</h2>`;
        return;
    }

    // Seçenek butonlarını oluştur
    mevcutDurak.secenekler.forEach((secenek, index) => {
        const button = document.createElement('button');
        button.innerText = secenek.metin;
        button.onclick = () => secimYap(index + 1);
        seceneklerDOM.appendChild(button);
    });
}

function secimYap(secimNo) {
    if (oyunDurumu.oyunBitti) return;

    const mevcutDurak = ZAMAN_DURAKLARI[oyunDurumu.tur];
    const secilen = mevcutDurak.secenekler[secimNo - 1];
    
    // 1. Durumu Güncelle
    oyunDurumu.risk = Math.max(0, oyunDurumu.risk + secilen.risk);
    oyunDurumu.mesaj = `Seçiminiz: ${secilen.metin}. SONUÇ: ${secilen.etki}`;
    
    if (secilen.artefakt && !oyunDurumu.artefaktlar.includes(secilen.artefakt)) {
        oyunDurumu.artefaktlar.push(secilen.artefakt);
        oyunDurumu.mesaj += ` (+ Artefakt: ${secilen.artefakt})`;
    }

    // 2. Bir Sonraki Tura Geç
    oyunDurumu.tur++;

    if (oyunDurumu.tur > MAKS_TUR || oyunDurumu.risk >= 100 || oyunDurumu.tur > Object.keys(ZAMAN_DURAKLARI).length) {
        oyunBitisiniKontrolEt();
    }
    
    oyunuKaydet();
    setTimeout(ekraniGuncelle, 1000); // 1 saniye sonra yeni turu yükle
}

function oyunBitisiniKontrolEt() {
    oyunDurumu.oyunBitti = true;
    
    if (oyunDurumu.risk >= 100) {
        oyunDurumu.mesaj = "KRİTİK PARADOKS! Zaman çizelgesi çöktü. Başarısız oldunuz.";
    } else if (oyunDurumu.risk < 20) {
        oyunDurumu.mesaj = `TEBRİKLER! Zaman çizelgesini korudunuz. Topladığınız ${oyunDurumu.artefaktlar.length} artefakt ile geleceğe geri dönüyorsunuz.`;
    } else {
        oyunDurumu.mesaj = "Görev tamamlandı, ancak bıraktığınız riskler geleceği değiştirebilir.";
    }
}

function oyunuSifirla(onay = true) {
    if (onay && !confirm("Oyunu sıfırlamak istediğinizden emin misiniz?")) return;
    
    oyunDurumu = {
        tur: 1,
        risk: 0,
        artefaktlar: [],
        mesaj: "Hoş geldiniz, Zaman Ajanı. Göreviniz başladı.",
        oyunBitti: false
    };
    localStorage.removeItem('kronos_paradoksu');
    ekraniGuncelle();
}

// Oyunu başlat
window.onload = oyunuYukle;
             
