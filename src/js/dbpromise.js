import idb from 'idb';

const dbPromise = {
    
    db: idb.open('restaurant-reviews-db', 2, function(upgradeDb) {
        switch( upgradeDb.oldVersion) {
            case 0:
                upgradeDb.createObjectStore('restaurants', {keyPath: 'id' })
            case 1:
                upgradeDb.createObjectStore('reviews', {keyPath: 'id' })
                    .createIndex('restaurant_id', 'restaurant_id');
        }
    }),

    putRestaurants(restaurants) {

        if (!restaurants.push) restaurants = [restaurants];

        return this.db.then(db => {

            const store = db.transaction('restaurants', 'readwrite').objectStore('restaurants');

            Promise.all(restaurants.map(networkRestaurant => {

                return store.get(networkRestaurant.id).then(idbRestaurant => {

                    if (!idbRestaurant || networkRestaurant.updatedAt > idbRestaurant.updatedAt) {

                        return store.put(networkRestaurant);

                    }

                })

            })).then(function () {

                return store.complete;

            });

        });

    },

    putReviews(reviews){
        if(!reviews.push) reviews = [reviews]; //Convert to iterable object if not iterable

        return this.db.then(db => {
            const store = db.transaction('reviews', 'readwrite').objectStore('reviews');
            Promise.all(reviews.map(networkReview => {
                return store.get(networkReview.id).then(idbReview => {
                    if(!idbReview || networkReview.updatedAt > idbReview.upatedAt) {
                        return store.put(networkReview);
                    }
                });
            })).then(()=>{
                return store.complete;
            });
        });
    },

    getReviews(restaurantId){
        return this.db.then(db => {
            const storeIndex = db.transaction('reviews').objectStore('reviews')
                .index('restaurand_id');

            return storeIndex.getAll(Number(restaurantId))
        })
    },

    getRestaurants(id = undefined){

        return this.db.then(db => {

            const store = db.transaction('restaurants').objectStore('restaurants');

            // console.log("Searching for ID: ", id);
            if (id) return store.get(Number(id));

            // console.log("Returning all");
            return store.getAll();

        })

    }

}

export default dbPromise;