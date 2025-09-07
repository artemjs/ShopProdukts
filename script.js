// Supabase configuration
const SUPABASE_URL = 'https://dddkyenqlhthmhghxjkm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkZGt5ZW5xbGh0aG1oZ2h4amttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNzI0NDAsImV4cCI6MjA3MjY0ODQ0MH0.7drZA0TS-J463VvM-ToIvXLk5rNIRqRkLXJJ4tsDh50';

// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const productsGrid = document.getElementById('productsGrid');
const filterBtns = document.querySelectorAll('.filter-btn');
// Admin panel removed - use admin.html instead

// Global variables
let currentBaseId = null;
let availableBases = [];
let availableCategories = [];

// Load available bases from products
async function loadAvailableBases() {
    try {
        console.log('Loading bases from Supabase...');
        const { data, error } = await supabaseClient
            .from('products')
            .select('base_id')
            .eq('is_active', true);

        console.log('Bases query result:', { data, error });

        if (error) {
            console.log('Error loading bases:', error);
            return [];
        }

        // Get unique base_ids (filter out null values)
        const uniqueBases = [...new Set(data.map(item => item.base_id).filter(id => id !== null))];
        console.log('Unique bases found:', uniqueBases);
        return uniqueBases;
    } catch (error) {
        console.log('Error loading bases:', error);
        return [];
    }
}

// Load available categories from products
async function loadAvailableCategories() {
    try {
        let query = supabaseClient
            .from('products')
            .select('name, description, category')
            .eq('is_active', true);

        // Filter by current base if selected
        if (currentBaseId) {
            query = query.eq('base_id', currentBaseId);
        }

        const { data, error } = await query;

        if (error) {
            console.log('Error loading categories:', error);
            return [];
        }

        // Get categories - use existing or generate from text
        const categories = data.map(item => {
            if (item.category) {
                return item.category;
            } else {
                return generateCategoryFromText(item.name, item.description);
            }
        });

        // Filter categories based on base
        let filteredCategories = categories;
        if (currentBaseId === 'main') {
            // For main base, exclude alcohol categories
            filteredCategories = categories.filter(cat => 
                !['Alcohol', 'Пиво', 'Горілка', 'Коньяк', 'Вино', 'Сидр', 'Джин', 'Бренді', 'Шампанське', 'Енергетичні напої', 'Квас', 'Алкогольні напої'].includes(cat)
            );
        } else if (currentBaseId === 'alcohol') {
            // For alcohol base, only show alcohol-related categories
            filteredCategories = categories.filter(cat => 
                ['Пиво', 'Горілка', 'Коньяк', 'Вино', 'Сидр', 'Джин', 'Бренді', 'Шампанське', 'Енергетичні напої', 'Квас', 'Алкогольні напої', 'Інші товари'].includes(cat)
            );
        }

        // Get unique categories
        const uniqueCategories = [...new Set(filteredCategories)];
        return uniqueCategories;
    } catch (error) {
        console.log('Error loading categories:', error);
        return [];
    }
}

// Create base selector
function createBaseSelector() {
    console.log('Creating base selector element...');
    const baseSelector = document.createElement('div');
    baseSelector.className = 'base-selector';
    baseSelector.innerHTML = `
        <div class="base-selector-content">
            <h3>Оберіть базу продуктів:</h3>
            <div class="base-buttons" id="baseButtons">
                <!-- Base buttons will be added here -->
            </div>
            <div class="current-base-info" id="currentBaseInfo">
                <span>Поточна база: <strong id="currentBaseName">Не обрано</strong></span>
            </div>
        </div>
    `;
    
    // Insert after hero section
    const hero = document.querySelector('.hero');
    console.log('Hero element found:', hero);
    if (hero) {
        hero.insertAdjacentElement('afterend', baseSelector);
        console.log('Base selector inserted after hero');
    } else {
        console.error('Hero element not found!');
    }
}

// Get display name for base
function getBaseDisplayName(baseId) {
    const baseNames = {
        'main': 'Основна',
        'alcohol': 'Алкоголь',
        'test': 'Тестова'
    };
    return baseNames[baseId] || baseId;
}

// Generate category from product name and description
function generateCategoryFromText(name, description) {
    const text = (name + ' ' + (description || '')).toLowerCase();
    
    // Alcohol categories
    if (text.includes('пиво') || text.includes('beer')) return 'Пиво';
    if (text.includes('горілка') || text.includes('водка')) return 'Горілка';
    if (text.includes('коньяк') || text.includes('коньяк')) return 'Коньяк';
    if (text.includes('вино') || text.includes('wine')) return 'Вино';
    if (text.includes('сидр') || text.includes('cider')) return 'Сидр';
    if (text.includes('джин') || text.includes('gin')) return 'Джин';
    if (text.includes('бренді') || text.includes('brandy')) return 'Бренді';
    if (text.includes('шампанське') || text.includes('champagne')) return 'Шампанське';
    if (text.includes('енергетичний') || text.includes('energy')) return 'Енергетичні напої';
    if (text.includes('квас')) return 'Квас';
    if (text.includes('алкоголь') || text.includes('alcohol')) return 'Алкогольні напої';
    
    // Food categories
    if (text.includes('хліб') || text.includes('bread')) return 'Хлібобулочні вироби';
    if (text.includes('молоко') || text.includes('milk')) return 'Молочні продукти';
    if (text.includes('сир') || text.includes('cheese')) return 'Молочні продукти';
    if (text.includes('масло') || text.includes('butter')) return 'Молочні продукти';
    if (text.includes('яйця') || text.includes('egg')) return 'Яйця';
    if (text.includes('ковбаса') || text.includes('sausage')) return 'М\'ясні вироби';
    if (text.includes('м\'ясо') || text.includes('meat')) return 'М\'ясні вироби';
    if (text.includes('цукор') || text.includes('sugar')) return 'Сипучі продукти';
    if (text.includes('сіль') || text.includes('salt')) return 'Сипучі продукти';
    if (text.includes('борошно') || text.includes('flour')) return 'Сипучі продукти';
    if (text.includes('чай') || text.includes('tea')) return 'Напої';
    if (text.includes('кава') || text.includes('coffee')) return 'Напої';
    if (text.includes('сок') || text.includes('juice')) return 'Напої';
    
    // Default category
    return 'Інші товари';
}

// Update base buttons
function updateBaseButtons(bases) {
    console.log('Updating base buttons with bases:', bases);
    const baseButtons = document.getElementById('baseButtons');
    console.log('Base buttons element found:', baseButtons);
    if (!baseButtons) {
        console.error('Base buttons element not found!');
        return;
    }

    const buttonsHTML = bases.map(baseId => `
        <button class="base-btn ${currentBaseId === baseId ? 'active' : ''}" data-base-id="${baseId}">
            ${getBaseDisplayName(baseId)}
        </button>
    `).join('');
    
    console.log('Buttons HTML:', buttonsHTML);
    baseButtons.innerHTML = buttonsHTML;

    // Add event listeners
    baseButtons.querySelectorAll('.base-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            currentBaseId = btn.dataset.baseId;
            updateBaseButtons(bases);
            updateCurrentBaseDisplay();
            
            // Reload categories for selected base
            availableCategories = await loadAvailableCategories();
            updateCategoryFilters(availableCategories);
            updateCategorySelect(availableCategories);
            
            loadProducts();
        });
    });
}

// Update current base display in admin panel and main interface
function updateCurrentBaseDisplay() {
    // Update admin panel
    const currentBaseDisplay = document.getElementById('currentBaseDisplay');
    if (currentBaseDisplay) {
        currentBaseDisplay.textContent = currentBaseId ? getBaseDisplayName(currentBaseId) : 'Не обрано';
    }
    
    // Update main interface
    const currentBaseName = document.getElementById('currentBaseName');
    if (currentBaseName) {
        currentBaseName.textContent = currentBaseId ? getBaseDisplayName(currentBaseId) : 'Не обрано';
    }
}

// Update category filters
function updateCategoryFilters(categories) {
    const productsFilter = document.querySelector('.products-filter');
    if (!productsFilter) return;

    // Clear existing filters except "All"
    const existingFilters = productsFilter.querySelectorAll('.filter-btn:not([data-category="all"])');
    existingFilters.forEach(filter => filter.remove());

    // Add new category filters
    const allFilter = productsFilter.querySelector('[data-category="all"]');
    categories.forEach(category => {
        const filterBtn = document.createElement('button');
        filterBtn.className = 'filter-btn';
        filterBtn.setAttribute('data-category', category);
        filterBtn.textContent = getCategoryDisplayName(category);
        
        // Insert before the last element (if any)
        productsFilter.insertBefore(filterBtn, allFilter.nextSibling);
    });

    // Re-add event listeners
    productsFilter.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            productsFilter.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Update current filter
            currentFilter = btn.dataset.category;
            
            // Reload products with new filter
            loadProducts();
        });
    });
}

// Get display name for category
function getCategoryDisplayName(category) {
    const categoryNames = {
        'vegetables': 'Овочі',
        'fruits': 'Фрукти',
        'dairy': 'Молочні',
        'meat': 'М\'ясо',
        'bakery': 'Випічка',
        'beverages': 'Напої',
        'snacks': 'Закуски',
        'frozen': 'Заморожені',
        'canned': 'Консерви',
        'spices': 'Приправи'
    };
    return categoryNames[category] || category;
}

// Update category select in admin panel
function updateCategorySelect(categories) {
    const categorySelect = document.getElementById('productCategory');
    if (!categorySelect) return;

    // Clear existing options except the first one
    categorySelect.innerHTML = '<option value="">Оберіть категорію</option>';
    
    // Add category options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = getCategoryDisplayName(category);
        categorySelect.appendChild(option);
    });
}

// Mobile Navigation
navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on links
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Admin Panel
// Admin panel event listeners removed

// Product Management
let currentFilter = 'all';

// Sample products data (will be replaced with Supabase data)
const sampleProducts = [
    {
        id: 1,
        name: 'Помідори',
        price: 45.00,
        category: 'vegetables',
        description: 'Свіжі червоні помідори',
        image: 'https://images.unsplash.com/photo-1546470427-5c4e4e1b1b1b?w=400'
    },
    {
        id: 2,
        name: 'Яблука',
        price: 35.00,
        category: 'fruits',
        description: 'Солодкі яблука сорт Голден',
        image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400'
    },
    {
        id: 3,
        name: 'Молоко',
        price: 28.00,
        category: 'dairy',
        description: 'Свіже коров\'яче молоко 1л',
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400'
    },
    {
        id: 4,
        name: 'Курятина',
        price: 120.00,
        category: 'meat',
        description: 'Свіжа курятина 1кг',
        image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400'
    },
    {
        id: 5,
        name: 'Огірки',
        price: 40.00,
        category: 'vegetables',
        description: 'Свіжі огірки з грядки',
        image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400'
    },
    {
        id: 6,
        name: 'Банани',
        price: 50.00,
        category: 'fruits',
        description: 'Стиглі банани',
        image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400'
    }
];

// Load products from Supabase or use sample data
async function loadProducts() {
    try {
        console.log('Loading products...');
        console.log('Current base ID:', currentBaseId);
        
        // First, let's check if table exists and has data
        const { data: allData, error: allError } = await supabaseClient
            .from('products')
            .select('*')
            .limit(5);

        console.log('All products sample:', allData);
        console.log('Query error:', allError);
        
        if (allData && allData.length > 0) {
            console.log('is_active values:', allData.map(p => ({ id: p.id, name: p.name, is_active: p.is_active, base_id: p.base_id })));
        } else {
            console.log('❌ Таблица products пустая или не существует!');
        }

        let query = supabaseClient
            .from('products')
            .select('*')
            .eq('is_active', true)
            .gt('current_stock', 0);

        // Filter by base_id if selected
        if (currentBaseId) {
            query = query.eq('base_id', currentBaseId);
        }

        const { data, error } = await query.order('id', { ascending: false });

        console.log('Products data:', data);
        console.log('Products error:', error);

        if (error) {
            console.log('Supabase error:', error);
            displayProducts(sampleProducts);
        } else {
            displayProducts(data || sampleProducts);
        }
    } catch (error) {
        console.log('Using sample data:', error);
        displayProducts(sampleProducts);
    }
}

// Display products in grid
function displayProducts(products) {
    // Add generated category to products without category
    const productsWithCategories = products.map(product => ({
        ...product,
        displayCategory: product.category || generateCategoryFromText(product.name, product.description)
    }));

    const filteredProducts = currentFilter === 'all' 
        ? productsWithCategories 
        : productsWithCategories.filter(product => product.displayCategory === currentFilter);

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <i class="fas fa-search" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
                <h3 style="color: #666;">Товари не знайдено</h3>
                <p style="color: #999;">Спробуйте іншу категорію</p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card" data-category="${product.displayCategory}">
            <div class="product-image">
                <i class="fas fa-image"></i>
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description || ''}</p>
                <div class="product-price">${product.price.toFixed(2)} ${product.currency || 'грн'}</div>
                ${product.current_stock !== null && product.current_stock !== undefined ? `<div class="product-stock">В наявності: ${product.current_stock}</div>` : ''}
            </div>
        </div>
    `).join('');
}

// Filter products - event listeners are now added dynamically in updateCategoryFilters

// Add new product
// Product form removed - use admin.html instead

// Show message function
function showMessage(text, type) {
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    // Insert at the beginning of modal body
    const modalBody = document.querySelector('.modal-body');
    modalBody.insertBefore(message, modalBody.firstChild);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        message.remove();
    }, 3000);
}

// Load products from localStorage if Supabase is not available
function loadLocalProducts() {
    const localProducts = JSON.parse(localStorage.getItem('products') || '[]');
    if (localProducts.length > 0) {
        displayProducts([...localProducts, ...sampleProducts]);
    } else {
        displayProducts(sampleProducts);
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    // Check if Supabase is configured
    if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
        console.log('Supabase not configured, using local storage');
        loadLocalProducts();
    } else {
        console.log('Supabase is configured, loading data...');
        
        // Load available bases and create selector
        availableBases = await loadAvailableBases();
        console.log('Available bases:', availableBases);
        
        availableCategories = await loadAvailableCategories();
        console.log('Available categories:', availableCategories);
        
        if (availableBases.length > 0) {
            console.log('Creating base selector...');
            console.log('Available bases:', availableBases);
            createBaseSelector();
            updateBaseButtons(availableBases);
            
            // Select first base by default
            currentBaseId = availableBases[0];
            console.log('Selected base ID:', currentBaseId);
            updateBaseButtons(availableBases);
            updateCurrentBaseDisplay();
        } else {
            console.log('No bases found, loading all products...');
            console.log('Available bases array:', availableBases);
        }
        
        // Update category filters
        if (availableCategories.length > 0) {
            console.log('Updating category filters...');
            updateCategoryFilters(availableCategories);
            updateCategorySelect(availableCategories);
        }
        
        console.log('Loading products...');
        loadProducts();
    }
    
    // Add scroll effect to header
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.feature-card, .product-card, .about-text, .contact-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Add loading state
function showLoading() {
    productsGrid.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
        </div>
    `;
}

// Error handling
window.addEventListener('error', (e) => {
    console.error('Error:', e.error);
});

// Service Worker registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
