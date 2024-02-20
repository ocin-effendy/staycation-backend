const Category = require('../models/Category');
const Item = require('../models/Item');
const Activity = require('../models/Activity');
const Booking = require('../models/Booking');
const Member = require('../models/Member');


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
    },

    itemDetails: async (req, res) => {
        try {
            const {id} = req.params;
            const item = await Item.findOne({_id: id})
                .populate({path: 'imageId', select: 'id imageUrl'})
                .populate({path: 'featureId', select: 'id qty name imageUrl'},)
                .populate({ path: 'activityId',select: 'id name type imageUrl'})
                .populate({
                    path: 'categoryId', 
                    select: 'id name itemId',
                    populate: {
                        path: 'itemId',
                        select: 'id title country city isPopular imageUrl'
                    }
                });

                const testimonial= {
                    _id: "asd1293uasdads1",
                    imageUrl: "/images/testimonial1.jpg",
                    name: "Happy Family",
                    rate: 4.55,
                    content: "What a great trip with my family and I should try again next time soon ...",
                    familyName: "Angga",
                    familyOccupation: "Product Designer"
                  }
            res.status(200).json({...item._doc, testimonial});
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
            
        }
    },

    bookingPage : async (req, res) => {
        try {
            const {
                itemId,
                duration,
                bookingDateStart,
                bookingDateEnd,
                firstName,
                lastName,
                emailAddress,
                phoneNumber,
                accountHolder,
                bankFrom,
              } = req.body;
            
            if(!req.file){
                return res.status(404).json({message: "not images"});
            }

            if(
                itemId === undefined ||
                duration === undefined ||
                bookingDateStart === undefined ||
                bookingDateEnd === undefined ||
                firstName === undefined ||
                lastName === undefined ||
                emailAddress === undefined ||
                phoneNumber === undefined ||
                accountHolder === undefined ||
                bankFrom === undefined
               ){
                    return res.status(404).json({message: "lengkapi item"});

                }

       

            const item = await Item.findOne({_id: itemId});
            if(!item){
                return res.status(404).json({message: "item not found"});
            }
            
            const member = await Member.create({
                firstName,
                lastName,
                email: emailAddress,
                phoneNumber
            });
            
   
            item.sumBooking += 1;
            await item.save();
            
 

            const invoice = Math.floor(1000000 + Math.random() * 9000000);
            const total = item.price * duration;
            const tax = total * 0.10;

                                

            const newBooking = {
                invoice: invoice,
                bookingStartDate: bookingDateStart,
                bookingEndDate: new Date(bookingDateEnd),
                total: total + tax,
                itemId: {
                    _id: item.id,
                    title: item.title,
                    price: item.price,
                    duration: duration
                },
                memberId: member.id,
                payments: {
                    proofPayment: `images/${req.file.filename}`,
                    bankFrom: bankFrom,
                    accountHolder: accountHolder,
                }
            }

            const booking = await Booking.create(newBooking);


            res.status(201).json({message: "Success Booking", booking});

        } catch (error) {
            res.status(404).json({message: error.message});
        }
    }
}