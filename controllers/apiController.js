const Category = require('../models/Category');
const Item = require('../models/Item');
const Activity = require('../models/Activity');
const Booking = require('../models/Booking');

module.exports = {
    landingPage: async (req, res) => {
        try {
            const mostPicked = await Item.find()
                .select('_id title country city price unit imageId')
                .populate({path: 'imageId', select: 'id imageUrl'})
                .limit(5);
            const travelers = await Booking.find();
            const treasures = await Activity.find();
            const cities = await Item.find();

            const categories = await Category.find()
                .select('_id name')
                .limit(3)
                .populate({
                    path: 'itemId', 
                    select: '_id title country city isPopular unit imageId',
                    option: {sort: {sumBooking: -1}},
                    populate: {
                        path: 'imageId',
                        select: 'id imageUrl',
                    perDocumentLimit: 1
                    },
                    perDocumentLimit: 4
                });

            for(let i = 0; i < categories.length; i++){
                for(let j = 0; j < categories[i].itemId.length; j++){
                    const item = await Item.findOne({_id: categories[i].itemId[j]._id});
                    item.isPopular = false;
                    await item.save();
                    if(categories[i].itemId[0] === categories[i].itemId[j]){
                        item.isPopular = true;
                        await item.save();
                    }
                }

            }

            const testimonial= {
                _id: "asd1293uasdads1",
                imageUrl: "/images/testimonial2.jpg",
                name: "Happy Family",
                rate: 4.55,
                content: "What a great trip with my family and I should try again next time soon ...",
                familyName: "Angga",
                familyOccupation: "Product Designer"
              }
            
            
            res.status(200).json({
                hero: {
                    travelers: travelers.length,
                    treasures: treasures.length,
                    cities: cities.length

                },
                mostPicked: mostPicked,
                categories: categories,
                testimonial: testimonial
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
            
        }
        
    }
}