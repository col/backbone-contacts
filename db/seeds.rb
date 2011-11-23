# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

(1..750).each do |num|
  Contact.create({
                first_name: Faker::Name.first_name,
                last_name: Faker::Name.last_name,
                address1: Faker::Address.street_address,
                #address2: Faker::Address.suburb,
                city: Faker::Address.city,
                state: Faker::Address.state,
                postcode: Faker::Address.postcode,
                country: Faker::Address.country
               })
end

