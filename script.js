document.addEventListener('DOMContentLoaded', function() {
    // Elemen DOM
    const iframe = document.getElementById('upload-iframe');
    const loadingOverlay = document.getElementById('loading-overlay');
    const autoResizeToggle = document.getElementById('auto-resize-toggle');
    const refreshIframeBtn = document.getElementById('refresh-iframe');
    const deviceInfo = document.getElementById('device-info');
    const screenSize = document.getElementById('screen-size');
    const resizeStatus = document.getElementById('resize-status');
    const iframeHeight = document.getElementById('iframe-height');
    const resizeCounter = document.getElementById('resize-counter');
    const iframeContainer = document.querySelector('.iframe-container');
    
    // Variabel state
    let isAutoResizeActive = true;
    let resizeCount = 0;
    let checkInterval;
    let lastIframeHeight = 0;
    let isIframeLoaded = false;
    
    // Fungsi untuk mendeteksi perangkat dan ukuran layar
    function detectDeviceAndScreen() {
        const width = window.innerWidth;
        const height = window.innerHeight;
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
        screenSize.textContent = `${width} × ${height}px`;
        
        return { width, height, deviceType };
    }
    
    // Fungsi untuk mendapatkan tinggi konten iframe
    function getIframeContentHeight() {
        try {
            // Coba akses konten iframe
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            if (!iframeDoc || !iframeDoc.body) {
                return null;
            }
            
            // Dapatkan tinggi konten
            const body = iframeDoc.body;
            const html = iframeDoc.documentElement;
            
            // Ambil tinggi maksimum dari body dan html
            const height = Math.max(
                body.scrollHeight,
                body.offsetHeight,
                html.clientHeight,
                html.scrollHeight,
                html.offsetHeight
            );
            
            return height;
        } catch (error) {
            console.log("Tidak dapat mengakses konten iframe:", error.message);
            return null;
        }
    }
    
    // Fungsi untuk menyesuaikan tinggi iframe
    function resizeIframeToContent() {
        if (!isAutoResizeActive || !isIframeLoaded) {
            return;
        }
        
        const contentHeight = getIframeContentHeight();
        
        if (contentHeight && contentHeight > 100) {
            // Tambahkan margin/padding jika diperlukan
            const adjustedHeight = contentHeight + 50;
            
            // Cegah perubahan kecil yang tidak perlu
            if (Math.abs(adjustedHeight - lastIframeHeight) > 10) {
                // Update tinggi iframe dengan animasi
                iframe.style.height = `${adjustedHeight}px`;
                lastIframeHeight = adjustedHeight;
                
                // Update tampilan tinggi
                iframeHeight.textContent = `Tinggi: ${adjustedHeight}px`;
                
                // Increment counter
                resizeCount++;
                resizeCounter.textContent = resizeCount;
                
                // Tambahkan efek visual
                iframeContainer.classList.add('resize-animation');
                setTimeout(() => {
                    iframeContainer.classList.remove('resize-animation');
                }, 500);
                
                console.log(`Iframe diresize ke: ${adjustedHeight}px`);
            }
        }
    }
    
    // Fungsi untuk memulai monitoring otomatis
    function startAutoResizeMonitoring() {
        if (checkInterval) {
            clearInterval(checkInterval);
        }
        
        // Cek perubahan setiap 500ms
        checkInterval = setInterval(resizeIframeToContent, 500);
        
        // Juga cek saat halaman di-scroll (untuk konten lazy load)
        window.addEventListener('scroll', resizeIframeToContent);
        
        // Cek saat ukuran window berubah
        window.addEventListener('resize', resizeIframeToContent);
        
        resizeStatus.textContent = "Aktif";
        resizeStatus.className = "status-ok";
        autoResizeToggle.classList.add('active');
        autoResizeToggle.innerHTML = '<i class="fas fa-arrows-alt-v"></i> Auto-Resize Aktif';
        
        console.log("Auto-resize monitoring diaktifkan");
    }
    
    // Fungsi untuk menghentikan monitoring otomatis
    function stopAutoResizeMonitoring() {
        if (checkInterval) {
            clearInterval(checkInterval);
            checkInterval = null;
        }
        
        window.removeEventListener('scroll', resizeIframeToContent);
        window.removeEventListener('resize', resizeIframeToContent);
        
        resizeStatus.textContent = "Nonaktif";
        resizeStatus.className = "status-inactive";
        autoResizeToggle.classList.remove('active');
        autoResizeToggle.innerHTML = '<i class="fas fa-arrows-alt-v"></i> Auto-Resize';
        
        console.log("Auto-resize monitoring dinonaktifkan");
    }
    
    // Fungsi untuk toggle fitur auto-resize
    function toggleAutoResize() {
        isAutoResizeActive = !isAutoResizeActive;
        
        if (isAutoResizeActive) {
            startAutoResizeMonitoring();
            // Segera resize setelah diaktifkan
            setTimeout(resizeIframeToContent, 100);
        } else {
            stopAutoResizeMonitoring();
        }
    }
    
    // Fungsi untuk refresh iframe
    function refreshIframe() {
        if (!isIframeLoaded) return;
        
        // Tampilkan loading overlay
        loadingOverlay.style.display = 'flex';
        loadingOverlay.style.opacity = '1';
        
        // Simpan src saat ini
        const currentSrc = iframe.src;
        
        // Refresh iframe
        iframe.src = '';
        setTimeout(() => {
            iframe.src = currentSrc;
            isIframeLoaded = false;
        }, 100);
        
        console.log("Iframe di-refresh");
    }
    
    // Fungsi untuk menangani event dari iframe
    function setupIframeCommunication() {
        // Event listener untuk pesan dari iframe
        window.addEventListener('message', function(event) {
            // Filter pesan hanya dari domain iframe jika diperlukan
            // if (event.origin !== "https://script.google.com") return;
            
            console.log("Pesan dari iframe:", event.data);
            
            // Jika iframe mengirimkan tinggi kontennya
            if (event.data && event.data.type === 'resize') {
                const height = event.data.height;
                if (height && isAutoResizeActive) {
                    iframe.style.height = `${height}px`;
                    lastIframeHeight = height;
                    iframeHeight.textContent = `Tinggi: ${height}px`;
                    
                    resizeCount++;
                    resizeCounter.textContent = resizeCount;
                }
            }
            
            // Jika iframe mengirimkan status loading
            if (event.data && event.data.type === 'loaded') {
                handleIframeLoad();
            }
        });
        
        // Coba kirim pesan ke iframe untuk meminta tinggi
        function requestIframeHeight() {
            try {
                if (iframe.contentWindow) {
                    iframe.contentWindow.postMessage({ type: 'getHeight' }, '*');
                }
            } catch (error) {
                console.log("Tidak dapat mengirim pesan ke iframe:", error.message);
            }
        }
        
        // Minta tinggi iframe secara berkala
        if (isAutoResizeActive) {
            setInterval(requestIframeHeight, 1000);
        }
    }
    
    // Fungsi untuk menangani iframe load
    function handleIframeLoad() {
        isIframeLoaded = true;
        
        // Sembunyikan loading overlay
        setTimeout(() => {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 500);
        }, 1000);
        
        // Jika auto-resize aktif, mulai monitoring
        if (isAutoResizeActive) {
            // Tunggu sebentar untuk konten dimuat sepenuhnya
            setTimeout(() => {
                resizeIframeToContent();
                startAutoResizeMonitoring();
            }, 1500);
        }
        
        console.log("Iframe berhasil dimuat");
    }
    
    // Fungsi untuk setup observer mutation (deteksi perubahan DOM)
    function setupMutationObserver() {
        // Coba setup observer di dalam iframe
        setTimeout(() => {
            try {
                const iframeDoc = iframe.contentDocument;
                if (iframeDoc) {
                    const observer = new MutationObserver(function(mutations) {
                        if (isAutoResizeActive) {
                            resizeIframeToContent();
                        }
                    });
                    
                    observer.observe(iframeDoc.body, {
                        childList: true,
                        subtree: true,
                        attributes: true,
                        characterData: true
                    });
                    
                    console.log("MutationObserver diaktifkan untuk iframe");
                }
            } catch (error) {
                console.log("Tidak dapat setup MutationObserver:", error.message);
            }
        }, 2000);
    }
    
    // Fungsi untuk inisialisasi
    function init() {
        // Deteksi perangkat
        detectDeviceAndScreen();
        
        // Setup event listeners
        autoResizeToggle.addEventListener('click', toggleAutoResize);
        refreshIframeBtn.addEventListener('click', refreshIframe);
        
        // Deteksi perubahan ukuran window
        window.addEventListener('resize', detectDeviceAndScreen);
        
        // Setup komunikasi iframe
        setupIframeCommunication();
        
        // Setup mutation observer
        setupMutationObserver();
        
        // Handle iframe load event
        iframe.addEventListener('load', handleIframeLoad);
        
        // Coba resize awal
        setTimeout(resizeIframeToContent, 2000);
        
        // Aktifkan auto-resize secara default
        startAutoResizeMonitoring();
        
        console.log("Sistem auto-resize diinisialisasi");
    }
    
    // Jalankan inisialisasi
    init();
});
