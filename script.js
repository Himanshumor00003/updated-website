let currentPage = 'home';
let currentFilters = {
    series: 'all',
    priceRange: 'all',
    screenSize: 'all'
};

// ==================== API FETCH FUNCTIONS ====================

async function fetchProducts() {
    try {
        let url = 'api/get_products.php?';
        if (currentFilters.series !== 'all') url += `series=${encodeURIComponent(currentFilters.series)}&`;
        if (currentFilters.priceRange !== 'all') {
            const [min, max] = currentFilters.priceRange.split('-');
            url += `min_price=${min}&`;
            if (max && max !== '999999') url += `max_price=${max}&`;
        }
        if (currentFilters.screenSize !== 'all') url += `screen_size=${encodeURIComponent(currentFilters.screenSize)}&`;
        const response = await fetch(url);
        const result = await response.json();
        return result.success ? result.data : [];
    } catch (error) {
        console.error('API Error:', error);
        return [];
    }
}

async function fetchFeaturedProducts() {
    try {
        const response = await fetch('api/get_featured.php');
        const result = await response.json();
        return result.success ? result.data : [];
    } catch (error) {
        console.error('API Error:', error);
        return [];
    }
}

// ==================== CART FUNCTIONS ====================

function updateCartIcon(count) {
    const badge = document.getElementById('cart-count');
    if (badge) badge.innerText = count;
}

async function refreshCartCount() {
    try {
        const res = await fetch('api/get_cart.php');
        const data = await res.json();
        if (data.success) updateCartIcon(data.count);
    } catch (err) {
        console.error('Failed to refresh cart count', err);
    }
}

async function addToCart(productId, quantity = 1) {
    const res = await fetch('api/add_to_cart.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity: quantity })
    });
    const data = await res.json();
    if (data.success) {
        alert('Added to cart!');
        updateCartIcon(data.cart_count);
    } else {
        alert(data.message);
    }
}

// ==================== NAVIGATION & RENDERING ====================

function toggleMenu() {
    const navMenu = document.getElementById('navMenu');
    navMenu.classList.toggle('active');
}

function navigateTo(page) {
    currentPage = page;
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    const navLinks = document.querySelectorAll('.nav-link');
    if (page === 'home') navLinks[0].classList.add('active');
    else if (page === 'about') navLinks[1].classList.add('active');
    else if (page === 'catalogue') navLinks[2].classList.add('active');
    
    const mainContent = document.getElementById('mainContent');
    if (page === 'about') mainContent.innerHTML = renderAbout();
    else renderPage();
    
    const navMenu = document.getElementById('navMenu');
    navMenu.classList.remove('active');
}

async function renderPage() {
    const mainContent = document.getElementById('mainContent');
    if (currentPage === 'home') {
        mainContent.innerHTML = '<div class="loading">Loading...</div>';
        const products = await fetchFeaturedProducts();
        mainContent.innerHTML = renderHome(products);
    } else if (currentPage === 'catalogue') {
        mainContent.innerHTML = '<div class="loading">Loading products...</div>';
        const products = await fetchProducts();
        mainContent.innerHTML = renderCatalogue(products);
        attachCatalogueEvents();
    }
}

// ==================== HOME PAGE ====================

function renderHome(featuredProducts) {
    const carouselImages = [
        { url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500', title: 'Quantum 4K Series', desc: 'Stunning 4K Resolution' },
        { url: 'https://shop.haierindia.com/blog/wp-content/uploads/2024/08/image5-49.jpg.webp', title: 'Ultra Vision', desc: 'Crystal Clear Display' },
        { url: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500', title: 'OLED Master', desc: 'Perfect Blacks' },
        { url: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500', title: 'Smart LED', desc: 'Built-in Apps' },
        { url: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=500', title: '8K Vision', desc: 'Ultimate Clarity' },
        { url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500', title: 'Gaming Edition', desc: '144Hz Refresh Rate' },
        { url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxj_E1gONzSM7AiZXyt-LBoHvTGEICMTHC7g&s', title: 'Crystal 4K', desc: 'Vibrant Colors' },
        { url: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500', title: 'Neo QLED', desc: 'Mini LED Technology' }
    ];
    const allImages = [...carouselImages, ...carouselImages];

    return `
        <div class="page-container">
            <div class="carousel-container">
                <div class="carousel-track">
                    ${allImages.map(image => `
                        <div class="carousel-slide" onclick="navigateTo('catalogue')">
                            <img src="${image.url}" alt="${image.title}">
                            <div class="carousel-caption"><h4>${image.title}</h4><p>${image.desc}</p></div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <section class="hero-section">
                <div class="hero-content">
                    <h1 class="hero-title">Experience the Future of Television</h1>
                    <p class="hero-subtitle">M-Series LED TVs bring cinematic excellence to your home with stunning 4K/8K resolution, smart features, and premium design.</p>
                    <div class="hero-buttons">
                        <button class="btn btn-primary" onclick="navigateTo('catalogue')">Explore Collection</button>
                    </div>
                </div>
            </section>
            <section class="features-section">
                <h2>Why Choose M-Series?</h2>
                <div class="features-grid">
                    <div class="feature-card"><i class="fas fa-microchip"></i><h3>Advanced Processor</h3><p>AI-powered 4K upscaling for crystal clear picture</p></div>
                    <div class="feature-card"><i class="fas fa-eye"></i><h3>HDR10+ Support</h3><p>Vibrant colors and deeper contrasts</p></div>
                    <div class="feature-card"><i class="fas fa-gamepad"></i><h3>Game Mode</h3><p>Low latency for smooth gaming experience</p></div>
                    <div class="feature-card"><i class="fas fa-wifi"></i><h3>Smart TV</h3><p>Built-in streaming apps and voice control</p></div>
                </div>
            </section>
            <section class="featured-section">
                <h2>Featured Products</h2>
                <div class="products-grid">
                    ${featuredProducts.map(product => `
                        <div class="product-card">
                            <img src="${product.image_url}" alt="${product.name}">
                            <div class="product-info">
                                <h3>${escapeHtml(product.name)}</h3>
                                <p class="series">${escapeHtml(product.series)}</p>
                                <p class="price">₹${parseInt(product.price).toLocaleString()}</p>
                                <button class="btn-small" onclick="addToCart(${product.id})">Add to Cart</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>
        </div>
    `;
}

// ==================== ABOUT PAGE (FULL CONTENT) ====================

function renderAbout() {
    return `
        <div style="max-width: 1200px; margin: 0 auto; padding: 2rem;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px; padding: 4rem 2rem; text-align: center; margin: 2rem 0; color: white;">
                <h1 style="font-size: 3rem; margin-bottom: 1rem;">About M-Series</h1>
                <p style="font-size: 1.2rem; opacity: 0.95;">Redefining visual excellence since 2020</p>
            </div>

            <div style="margin: 4rem 0;">
                <h2 style="text-align: center; font-size: 2rem; margin-bottom: 2rem; color: #333;">Our Mission</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                    <div style="background: white; padding: 2rem; border-radius: 15px; text-align: center; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">
                        <i class="fas fa-eye" style="font-size: 3rem; color: #667eea; margin-bottom: 1rem;"></i>
                        <h3 style="margin-bottom: 1rem;">Visual Excellence</h3>
                        <p style="color: #666;">To deliver unparalleled visual experiences through cutting-edge display technology and innovative design.</p>
                    </div>
                    <div style="background: white; padding: 2rem; border-radius: 15px; text-align: center; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">
                        <i class="fas fa-users" style="font-size: 3rem; color: #667eea; margin-bottom: 1rem;"></i>
                        <h3 style="margin-bottom: 1rem;">Customer First</h3>
                        <p style="color: #666;">To put our customers at the heart of everything we do, creating products that enhance everyday life.</p>
                    </div>
                    <div style="background: white; padding: 2rem; border-radius: 15px; text-align: center; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">
                        <i class="fas fa-microchip" style="font-size: 3rem; color: #667eea; margin-bottom: 1rem;"></i>
                        <h3 style="margin-bottom: 1rem;">Innovation</h3>
                        <p style="color: #666;">To push the boundaries of what's possible in television technology and smart home integration.</p>
                    </div>
                </div>
            </div>

            <div style="margin: 4rem 0;">
                <h2 style="text-align: center; font-size: 2rem; margin-bottom: 2rem; color: #333;">Our Journey</h2>
                <div style="max-width: 800px; margin: 0 auto;">
                    <div style="margin-bottom: 2rem; background: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                        <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 5px 15px; border-radius: 20px; font-weight: 600; margin-bottom: 1rem;">2020</div>
                        <h3 style="color: #667eea; margin-bottom: 0.5rem;">The Beginning</h3>
                        <p style="color: #666;">M-Series was founded with a vision to revolutionize the television industry with premium quality displays.</p>
                    </div>
                    <div style="margin-bottom: 2rem; background: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                        <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 5px 15px; border-radius: 20px; font-weight: 600; margin-bottom: 1rem;">2021</div>
                        <h3 style="color: #667eea; margin-bottom: 0.5rem;">First Breakthrough</h3>
                        <p style="color: #666;">Launched our first 4K QLED TV series, receiving critical acclaim for picture quality and design.</p>
                    </div>
                    <div style="margin-bottom: 2rem; background: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                        <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 5px 15px; border-radius: 20px; font-weight: 600; margin-bottom: 1rem;">2022</div>
                        <h3 style="color: #667eea; margin-bottom: 0.5rem;">Smart Innovation</h3>
                        <p style="color: #666;">Introduced AI-powered processors and smart TV capabilities across all models.</p>
                    </div>
                    <div style="margin-bottom: 2rem; background: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                        <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 5px 15px; border-radius: 20px; font-weight: 600; margin-bottom: 1rem;">2023</div>
                        <h3 style="color: #667eea; margin-bottom: 0.5rem;">8K Revolution</h3>
                        <p style="color: #666;">Launched our first 8K TVs with Mini LED technology, setting new industry standards.</p>
                    </div>
                    <div style="background: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                        <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 5px 15px; border-radius: 20px; font-weight: 600; margin-bottom: 1rem;">2024</div>
                        <h3 style="color: #667eea; margin-bottom: 0.5rem;">Global Expansion</h3>
                        <p style="color: #666;">Expanded to international markets and introduced gaming-optimized TVs.</p>
                    </div>
                </div>
            </div>

            <div style="margin: 4rem 0;">
                <h2 style="text-align: center; font-size: 2rem; margin-bottom: 2rem; color: #333;">Our Core Values</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem;">
                    <div style="text-align: center; padding: 2rem; background: white; border-radius: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">
                        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
                            <i class="fas fa-gem" style="font-size: 2.5rem; color: #667eea;"></i>
                        </div>
                        <h3 style="margin-bottom: 0.8rem;">Quality First</h3>
                        <p style="color: #666;">Uncompromising commitment to quality in every product we create.</p>
                    </div>
                    <div style="text-align: center; padding: 2rem; background: white; border-radius: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">
                        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
                            <i class="fas fa-lightbulb" style="font-size: 2.5rem; color: #667eea;"></i>
                        </div>
                        <h3 style="margin-bottom: 0.8rem;">Innovation</h3>
                        <p style="color: #666;">Constantly pushing boundaries with cutting-edge technology.</p>
                    </div>
                    <div style="text-align: center; padding: 2rem; background: white; border-radius: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">
                        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
                            <i class="fas fa-heart" style="font-size: 2.5rem; color: #667eea;"></i>
                        </div>
                        <h3 style="margin-bottom: 0.8rem;">Customer Trust</h3>
                        <p style="color: #666;">Building lasting relationships through transparency and reliability.</p>
                    </div>
                    <div style="text-align: center; padding: 2rem; background: white; border-radius: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">
                        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
                            <i class="fas fa-leaf" style="font-size: 2.5rem; color: #667eea;"></i>
                        </div>
                        <h3 style="margin-bottom: 0.8rem;">Sustainability</h3>
                        <p style="color: #666;">Committed to eco-friendly manufacturing and energy-efficient products.</p>
                    </div>
                </div>
            </div>

            <div style="margin: 4rem 0;">
                <h2 style="text-align: center; font-size: 2rem; margin-bottom: 2rem; color: #333;">Leadership Team</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;">
                    <div style="background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 5px 20px rgba(0,0,0,0.1); text-align: center;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem;">
                            <i class="fas fa-user-circle" style="font-size: 5rem; color: white;"></i>
                        </div>
                        <div style="padding: 1.5rem;">
                            <h3 style="margin-bottom: 0.5rem;">Rajesh Mehta</h3>
                            <p style="color: #667eea; font-weight: 600; margin-bottom: 1rem;">Founder & CEO</p>
                            <p style="color: #666;">20+ years of experience in display technology and consumer electronics.</p>
                        </div>
                    </div>
                    <div style="background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 5px 20px rgba(0,0,0,0.1); text-align: center;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem;">
                            <i class="fas fa-user-circle" style="font-size: 5rem; color: white;"></i>
                        </div>
                        <div style="padding: 1.5rem;">
                            <h3 style="margin-bottom: 0.5rem;">Priya Sharma</h3>
                            <p style="color: #667eea; font-weight: 600; margin-bottom: 1rem;">Chief Technology Officer</p>
                            <p style="color: #666;">Leading innovation in AI-powered display processing and smart TV technology.</p>
                        </div>
                    </div>
                    <div style="background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 5px 20px rgba(0,0,0,0.1); text-align: center;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem;">
                            <i class="fas fa-user-circle" style="font-size: 5rem; color: white;"></i>
                        </div>
                        <div style="padding: 1.5rem;">
                            <h3 style="margin-bottom: 0.5rem;">Ankit Verma</h3>
                            <p style="color: #667eea; font-weight: 600; margin-bottom: 1rem;">Head of Design</p>
                            <p style="color: #666;">Award-winning designer focused on minimalist aesthetics and premium finishes.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div style="margin: 4rem 0;">
                <h2 style="text-align: center; font-size: 2rem; margin-bottom: 2rem; color: #333;">Get in Touch</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem;">
                    <div style="background: white; padding: 2rem; border-radius: 15px; text-align: center; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">
                        <i class="fas fa-map-marker-alt" style="font-size: 2.5rem; color: #667eea; margin-bottom: 1rem;"></i>
                        <h3 style="margin-bottom: 0.5rem;">Visit Us</h3>
                        <p style="color: #666;">M-Series Tower, Sector 62<br>Noida, Uttar Pradesh - 201301</p>
                    </div>
                    <div style="background: white; padding: 2rem; border-radius: 15px; text-align: center; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">
                        <i class="fas fa-phone" style="font-size: 2.5rem; color: #667eea; margin-bottom: 1rem;"></i>
                        <h3 style="margin-bottom: 0.5rem;">Call Us</h3>
                        <p style="color: #666;">+91 1234567890<br>+91 9876543210</p>
                    </div>
                    <div style="background: white; padding: 2rem; border-radius: 15px; text-align: center; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">
                        <i class="fas fa-envelope" style="font-size: 2.5rem; color: #667eea; margin-bottom: 1rem;"></i>
                        <h3 style="margin-bottom: 0.5rem;">Email Us</h3>
                        <p style="color: #666;">support@mseries.com<br>sales@mseries.com</p>
                    </div>
                    <div style="background: white; padding: 2rem; border-radius: 15px; text-align: center; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">
                        <i class="fas fa-clock" style="font-size: 2.5rem; color: #667eea; margin-bottom: 1rem;"></i>
                        <h3 style="margin-bottom: 0.5rem;">Business Hours</h3>
                        <p style="color: #666;">Monday - Friday: 9:00 AM - 6:00 PM<br>Saturday: 10:00 AM - 4:00 PM</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ==================== CATALOGUE PAGE ====================

function renderCatalogue(products) {
    const seriesOptions = ['all', 'Quantum Pro', 'Ultra Vision', 'OLED Master', 'Smart HD', '8K Ultimate', 'Gaming Pro', 'Crystal Pro', 'Art Series', 'Outdoor', 'Neo Series'];
    const priceOptions = [
        { value: 'all', label: 'All Prices' },
        { value: '0-50000', label: 'Under ₹50,000' },
        { value: '50000-100000', label: '₹50,000 - ₹1,00,000' },
        { value: '100000-200000', label: '₹1,00,000 - ₹2,00,000' },
        { value: '200000-999999', label: 'Above ₹2,00,000' }
    ];
    const screenSizeOptions = ['all', '32"', '43"', '50"', '55"', '65"', '75"'];

    return `
        <div class="page-container catalogue">
            <h1>Our LED TV Collection</h1>
            <p class="catalogue-subtitle">Discover the perfect TV for your home</p>
            <div class="filters-section">
                <div class="filter-group"><label>Series</label><select id="filterSeries">${seriesOptions.map(opt => `<option value="${opt}" ${currentFilters.series === opt ? 'selected' : ''}>${opt === 'all' ? 'All Series' : opt}</option>`).join('')}</select></div>
                <div class="filter-group"><label>Price Range</label><select id="filterPrice">${priceOptions.map(opt => `<option value="${opt.value}" ${currentFilters.priceRange === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('')}</select></div>
                <div class="filter-group"><label>Screen Size</label><select id="filterSize">${screenSizeOptions.map(opt => `<option value="${opt}" ${currentFilters.screenSize === opt ? 'selected' : ''}>${opt === 'all' ? 'All Sizes' : opt}</option>`).join('')}</select></div>
            </div>
            <div class="products-count">Showing ${products.length} products</div>
            <div class="catalogue-grid">
                ${products.map(product => `
                    <div class="catalogue-card">
                        <img src="${product.image_url}" alt="${product.name}">
                        <div class="card-badge">${escapeHtml(product.series)}</div>
                        <div class="card-content">
                            <h3>${escapeHtml(product.name)}</h3>
                            <div class="specs"><span><i class="fas fa-tv"></i> ${product.screen_size}</span><span><i class="fas fa-chart-line"></i> ${product.refresh_rate}Hz</span><span><i class="fas fa-microchip"></i> ${product.display_technology}</span></div>
                            <p class="description">${escapeHtml(product.description)}</p>
                            <div class="price-tag">₹${parseInt(product.price).toLocaleString()}</div>
                            <div class="stock-status">${product.stock > 0 ? `<span class="in-stock"><i class="fas fa-check-circle"></i> In Stock (${product.stock} units)</span>` : '<span class="out-of-stock"><i class="fas fa-times-circle"></i> Out of Stock</span>'}</div>
                            <button class="btn-add-to-cart" onclick="addToCart(${product.id})">Add to Cart</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function attachCatalogueEvents() {
    const seriesSelect = document.getElementById('filterSeries');
    const priceSelect = document.getElementById('filterPrice');
    const sizeSelect = document.getElementById('filterSize');
    if (seriesSelect) seriesSelect.addEventListener('change', async (e) => { currentFilters.series = e.target.value; await renderPage(); });
    if (priceSelect) priceSelect.addEventListener('change', async (e) => { currentFilters.priceRange = e.target.value; await renderPage(); });
    if (sizeSelect) sizeSelect.addEventListener('change', async (e) => { currentFilters.screenSize = e.target.value; await renderPage(); });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    navigateTo('home');
    refreshCartCount();
});