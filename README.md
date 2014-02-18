# Crime coding challenge

Crimes are happening all over the world.
But, fortunately, humans have invented the Drones to watch their cities.

As drones can't make the difference between good and bad, help them identify crimes and put in jails some bad guys.

# Exercise 1:

You are a new freelance agency and have taken a maintenance contract over the Drones.

First, in order to start your new company, you need to be able to receive the Drones broadcasting news and register as a Drone contractor.

Technically, you need to create a webserver that will listen to an endpoint:

    /about

That return:

    { name: "YOUR_TEAM_NAME", avatar: "AVATAR_URL", city: "CITY_NAME" }

Once it is done, go to http://localhost:3000/register and enter the address of your server.

If all works well, you will start to receive news from the Drones at /broadcast, and your company will appear in the Drone Online Channel.

# Exercise 2:

Now you are all setup, you need to tell the Drones what they have to do.

On /broadcast, you receive informations about the crimes the Drones are observing.
For each crime, you need to send back an action to explain to the Drones how to treat people.

Typical crime report:

{
  id: 123456,
  criminalId: 123456,
  type: 'STEALING',
  amount: 200,
  location: {
    lat: 54.989,
    lng: -34.4545
  }
}

## Different types of crimes:

### type: STEALING

In case of someone stealing someone else property, the sentence is to pay back with an extra.
The ```amount``` property is only provided for STEALING and UNPAID
You have to return such objects:

{
  id: 123456,
  action: 'FINE',
  amount: 480
}

The formula is: (amount * 2) + 20%

### type: UNPAID

In case of someone who did not pay his parking tickets, the sentence is to pay the said ticket and a fine based on the country where the crime happened.
The return would look like that:

{
  id: 123456,
  action: 'FINE',
  amount: 600
}

To know the rules by country. The Drones provides a set of utilities.

    http://localhost:3000/geofines/LAT/LNG

And return:

{
  country: 'FRANCE',
  amount: 200
}

### type: MURDER

Murder is the highest crime. This is automatically jail.
The trick is that you have to tell the drone where is the closest facility.

{
  id: 123456,
  action: 'JAIL',
  name: 'Prison name'
}

You can find a list of all the prison at

    http://localhost:3000/facilities

[{
  name: 'Prison name'
  location: {
    lat: 45.34,
    lng: -33.454
  }
}]

WARNING: If you assign the bad action, you loose points.

# Exercise 3:

Sometimes, people are comitting crimes again and again.
Report to the Drones when you detect a repeat offence.
