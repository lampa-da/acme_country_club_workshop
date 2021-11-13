const Sequelize = require('sequelize')
const {STRING, UUID, UUIDV4, DATE, NOW} = Sequelize
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_country_club_db')

const express = require('express')
const app = express()

const Member = conn.define( 'member', {
  id: {
    type: UUID,
    primaryKey: true,
    defaultValue: UUIDV4
  },
  first_name: {
    type: STRING(100)
  }
})

const Facility = conn.define( 'facility', {
  id: {
    type: UUID,
    primaryKey: true,
    defaultValue: UUIDV4
  },
  fac_name: {
    type: STRING(20)
  }
})

const Booking = conn.define( 'booking', {
  id: {
    type: UUID,
    primaryKey: true,
    defaultValue: UUIDV4
  },
  startTime: {
    type: DATE,
    defaultValue: NOW,
    allowNull: false
  },
  endTime: {
    type: DATE,
    defaultValue: NOW,
    allowNull: false
}
})



Member.belongsTo(Member, {as: 'sponsor'})
Member.hasMany(Member, {foreignKey: 'sponsorId', as: 'sponsored'})

Booking.belongsTo(Member, {as: 'bookedBy'})
Member.hasMany(Booking, {foreignKey: 'bookedById'})

Booking.belongsTo(Facility)
Facility.hasMany(Booking)

Booking.belongsToMany(Member, {through: 'Booking_Member'})

const syncAndSeed = async()=>{
  await conn.sync({force: true})
  const [moe, lucy, larry, ethyl, tennis, ping_pong, raquet_ball, bowling] = await Promise.all([
    Member.create({first_name: 'moe'}),
    Member.create({first_name: 'lucy'}),
    Member.create({first_name: 'larry'}),
    Member.create({first_name: 'ethyl'}),
    Facility.create({fac_name: 'tennis'}),
    Facility.create({fac_name: 'ping-pong'}),
    Facility.create({fac_name: 'raquet-ball'}),
    Facility.create({fac_name: 'bowling'})
  ])
  await Promise.all([
    larry.update({ sponsorId: lucy.id }),
    moe.update({ sponsorId: lucy.id }),
    ethyl.update({ sponsorId: moe.id }),
  ]);
  await Promise.all([
    Booking.create({ facilityId: tennis.id, bookedById: moe.id }),
    Booking.create({ facilityId: ping_pong.id, bookedById: lucy.id }),
  ]);
}

module.exports ={
  syncAndSeed,
  models: {
    Member,
    Facility,
    Booking
  },
  conn

}