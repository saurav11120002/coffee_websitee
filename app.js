document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reviewForm');
    const reviewsList = document.getElementById('reviews-list');

    const loadReviews = () => {
        fetch('http://localhost:3000/reviews')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load reviews');
                }
                return response.json();
            })
            .then(reviews => {
                reviewsList.innerHTML = '';
                reviews.forEach(review => {
                    const li = document.createElement('li');
                    li.innerHTML = `<strong>${review.name}</strong>: ${review.review} <br> Rating: ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}`;
                    
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.addEventListener('click', () => {
                        deleteReview(review.id);
                    });

                    li.appendChild(deleteButton);
                    reviewsList.appendChild(li);
                });
            })
            .catch(error => console.error('Error loading reviews:', error));
    };

    const deleteReview = (id) => {
        fetch(`http://localhost:3000/reviews/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete review');
            }
            loadReviews();
        })
        .catch(error => console.error('Error deleting review:', error));
    };

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const review = document.getElementById('review').value;
        const name = document.getElementById('name').value;
        const rating = document.querySelector('input[name="rating"]:checked')?.value;

        if (!rating) {
            alert("Please select a rating.");
            return;
        }

        const reviewData = { name, review, rating: parseInt(rating) };

        fetch('http://localhost:3000/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reviewData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to add review');
            }
            loadReviews();
            form.reset();
        })
        .catch(error => console.error('Error adding review:', error));
    });

    // Load reviews on initial page load
    loadReviews();

    // Section Navigation Functionality
    const sections = document.querySelectorAll("section");
    const navItems = document.querySelectorAll(".navlist li");

    // Map section IDs to navlist item IDs
    const sectionMap = {
        "home": "nav1",
        "about-us": "nav2",
        "customers": "nav4",
        "contacts": "nav5"
    };

    // Function to update the active class based on the current section in view
    const updateActiveClass = () => {
        let currentSection = null;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const scrollPosition = window.scrollY + window.innerHeight / 2;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.id;
            }
        });

        if (currentSection) {
            navItems.forEach(item => {
                item.classList.remove("active");
            });

            const activeNavId = sectionMap[currentSection];
            if (activeNavId) {
                document.getElementById(activeNavId).classList.add("active");
            }
        }
    };

    // Update active class on page load and scroll
    updateActiveClass();
    window.addEventListener("scroll", updateActiveClass);

    // Handle hover and click on nav items
    navItems.forEach(item => {
        item.addEventListener("mouseenter", () => {
            navItems.forEach(nav => nav.classList.remove("hover"));
            item.classList.add("hover");
        });

        item.addEventListener("mouseleave", () => {
            item.classList.remove("hover");
        });

        item.addEventListener("click", () => {
            navItems.forEach(nav => nav.classList.remove("active"));
            item.classList.add("active");
        });
    });
});
