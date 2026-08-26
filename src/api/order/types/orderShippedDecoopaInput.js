const schema = `
  input OrderShippedDecoopaInput {
    id: String!
    shipping_company: String!
    tracking_number: String
    tracking_link: String
    itemsID: [itemInputs]
    decription: String
        weight:String
        serviceType:String
        service:String
        serviceCategory:String
        paymentType:String
        cod:String
        specialNotes:String
        customerName: String
        mobileNo: String
        buildingNo: String
        street: String
        floorNo: String
        apartmentNo: String
        city: String
        neighborhood: String
        district: String
        addressCategory: String
        country: String
        customerValue: String
        currency: String
        geoLocation: String
        pickupDueDate: String
        serviceDate: String 
        mobileNo2:String
  }
    input itemInputs {
    pieceNo: String
    Weight: String
    ItemCategory: String
    SpecialNotes: String
  }
`;


const resolver = {};

exports.schema = schema;
exports.resolver = resolver;