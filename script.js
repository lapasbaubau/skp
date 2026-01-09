document.addEventListener('DOMContentLoaded', function() {
    // Elemen DOM
    const iframe = document.getElementById('upload-iframe');
    const loadingOverlay = document.getElementById('loading-overlay');
    const toggleViewBtn = document.getElementById('toggle-view');
    const deviceInfo = document.getElementById('device-info');
    const screenWidth = document.getElementById('screen-width');
    const screenHeight = document.getElementById('screen-height');
    
    let isFullView = false;
    
    // Fungsi untuk mendeteksi perangkat
    function detectDevice() {
        const width = window.innerWidth;
        let deviceType = "Desktop";
        
        if (width < 576) {
            deviceType = "Mobile (Small)";
        } else if (width < 768) {
            deviceType = "Mobile";
        } else if (width < 992) {
            deviceType = "Tablet";
        } else if (width < 1200) {
            deviceType = "Desktop (Small)";
        }
        
        deviceInfo.textContent = `Perangkat: ${deviceType}`;
        screenWidth.textContent = width;
        screenHeight.textContent = window.innerHeight;
    }
    
    // Fungsi untuk menyesuaikan tinggi iframe secara responsif
    function adjustIframeHeight() {
        const viewportHeight = window.innerHeight;
        const headerHeight = document.querySelector('header').offsetHeight;
        const mainPadding = 40; // Padding atas dan bawah main
        const iframeContainerPadding = 120; // Header dan footer iframe
        
        // Hitung tinggi optimal untuk iframe
        let optimalHeight = viewportHeight - headerHeight - mainPadding - iframeContainerPadding;
        
        // Batasi tinggi minimum dan maksimum
        optimalHeight = Math.max(500, Math.min(optimalHeight, 900));
        
        // Terapkan tinggi ke iframe
        iframe.style.height = `${optimalHeight}px`;
        
        console.log(`Mengatur tinggi iframe: ${optimalHeight}px`);
    }
    
    // Fungsi untuk toggle mode tampilan iframe
    function toggleIframeView() {
        isFullView = !isFullView;
        
        if (isFullView) {
            // Mode penuh - sembunyikan elemen lain
            document.querySelector('header').style.display = 'none';
            document.querySelector('.upload-info').style.display = 'none';
            document.querySelector('.instructions').style.display = 'none';
            document.querySelector('footer').style.display = 'none';
            
            // Perbesar iframe
            iframe.style.height = `${window.innerHeight - 100}px`;
            toggleViewBtn.innerHTML = '<i class="fas fa-compress-alt"></i> Mode Normal';
            
            document.body.style.padding = '0';
            document.querySelector('main').style.padding = '0';
            document.querySelector('.iframe-container').style.borderRadius = '0';
            document.querySelector('.iframe-container').style.boxShadow = 'none';
        } else {
            // Mode normal - tampilkan semua elemen
            document.querySelector('header').style.display = 'block';
            document.querySelector('.upload-info').style.display = 'flex';
            document.querySelector('.instructions').style.display = 'block';
            document.querySelector('footer').style.display = 'block';
            
            // Kembalikan iframe ke ukuran responsif
            adjustIframeHeight();
            toggleViewBtn.innerHTML = '<i class="fas fa-expand-alt"></i> Mode Penuh';
            
            document.body.style.padding = '';
            document.querySelector('main').style.padding = '2rem 0';
            document.querySelector('.iframe-container').style.borderRadius = '10px';
            document.querySelector('.iframe-container').style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
        }
    }
    
    // Fungsi untuk menangani event dari iframe (jika diperlukan)
    function setupIframeListener() {
        window.addEventListener('message', function(event) {
            // Jika iframe mengirimkan pesan tentang tinggi kontennya
            if (event.data && event.data.type === 'iframeHeight') {
                if (!isFullView) {
                    // Atur tinggi iframe sesuai dengan kontennya
                    iframe.style.height = `${event.data.height}px`;
                }
            }
        });
    }
    
    // Fungsi untuk menangani loading iframe
    function handleIframeLoad() {
        // Sembunyikan loading overlay setelah iframe dimuat
        setTimeout(() => {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 300);
        }, 1000);
        
        console.log('Iframe berhasil dimuat');
    }
    
    // Fungsi untuk inisialisasi
    function init() {
        // Deteksi perangkat saat pertama kali dimuat
        detectDevice();
        
        // Atur tinggi iframe secara responsif
        adjustIframeHeight();
        
        // Setup event listeners
        toggleViewBtn.addEventListener('click', toggleIframeView);
        window.addEventListener('resize', function() {
            detectDevice();
            adjustIframeHeight();
        });
        
        // Setup iframe listener
        setupIframeListener();
        
        // Handle iframe load event
        iframe.addEventListener('load', handleIframeLoad);
        
        // Jika iframe sudah dimuat, sembunyikan loading
        if (iframe.complete) {
            handleIframeLoad();
        }
    }
    
    // Jalankan inisialisasi
    init();
});
