import { compose, prop, path, __, curry } from 'ramda'


const banners = {
  'AB': '/assets/banners/alberta.jpg',
  'BC': '/assets/banners/british-columbia.jpg',
  'MB': '/assets/banners/manitoba.jpg',
  'NL': '/assets/banners/newfoundland-labrador.jpg',
  'NS': '/assets/banners/nova-scotia.jpg',
  'NT': '/assets/banners/northwest-territories.jpg',
  'ON': '/assets/banners/ontario.jpg',
  'PE': '/assets/banners/prince-edward.jpg',
  'QC': '/assets/banners/quebec.jpg',
  'SK': '/assets/banners/saskatchewan.jpg',
  'YT': '/assets/banners/yukon.jpg',
}

var userOk = {
  email: 'james@example.com',
  accountDetails: {
    address: {
      street: '123 Fake St',
      city: 'Exampleville',
      province: 'NS',
      postcode: '1234'
    }
  },
  preferences: {}
}
var userNotLogged = {}
var userError = null
var userNoDetailsFilled = {
  email: 'james@example.com',
  accountDetails: {}
}


///////////////////


// The Problem //

// imperative //

function getUserBanner1(banners, user) {
  if (user != null) {
    if (user.accountDetails != null) {
      if (user.accountDetails.address != null) {
        return banners[user.accountDetails.address.province]
      }
    }
  }
}
const userOkBanner1 = getUserBanner1(banners, userOk)
userOkBanner1
const userNotLoggedBanner1 = getUserBanner1(banners, userNotLogged)
userNotLoggedBanner1
const userErrorBanner1 = getUserBanner1(banners, userError)
userErrorBanner1
const userNoDetailsFilledBanner1 = getUserBanner1(banners, userNoDetailsFilled)
userNoDetailsFilledBanner1

// fp //

const getUserBanner2 = compose(
  prop(__, banners),
  path(['accountDetails', 'address', 'province'])
)
const userOkBanner2 = getUserBanner2(userOk)
userOkBanner2
const userNotLoggedBanner2 = getUserBanner2(banners, userNotLogged)
userNotLoggedBanner2
const userErrorBanner2 = getUserBanner2(banners, userError)
userErrorBanner2
const userNoDetailsFilledBanner2 = getUserBanner2(banners, userNoDetailsFilled)
userNoDetailsFilledBanner2


//////////////////


// OOP MONAD //

function Maybe(value) {
  this.__value = value
}
Maybe.of = function (val) {
  return new Maybe(val)
}
// Main check helper method of Maybe
Maybe.prototype.exists = function () {
  return this.__value != null
}
// It's the Point of Maybe monad - checking if value exists and passes null if it's not
Maybe.prototype.map = function (f) {
  return this.exists() ? Maybe.of(f(this.__value)) : Maybe.of(f(null))
}

function getUserBanner3(banners, user) {
  return Maybe.of(user)
    .map(prop('accountDetails'))
    .map(prop('address'))
    .map(prop('province'))
    .map(prop(__, banners))
}
const userOkBanner3 = getUserBanner3(banners, userOk)
userOkBanner3
const userNotLoggedBanner3 = getUserBanner3(banners, userNotLogged)
userNotLoggedBanner3
const userErrorBanner3 = getUserBanner3(banners, userError)
userErrorBanner3
const userNoDetailsFilledBanner3 = getUserBanner3(banners, userNoDetailsFilled)
userNoDetailsFilledBanner3


/////////////


// adding another Maybe layer //

// with OOP //

function getProvinceBanner (province) {
  return Maybe.of(banners[province])
}

function getUserBanner4(banners, user) {
  return Maybe.of(user)
    .map(prop('accountDetails'))
    .map(prop('address'))
    .map(prop('province'))
    .map(getProvinceBanner)  // .map(prop(__, banners))
}
// and now we've got 2 layers deep Maybe
const userOkBanner4 = getUserBanner4(banners, userOk)
userOkBanner4
const userNotLoggedBanner4 = getUserBanner4(banners, userNotLogged)
userNotLoggedBanner4
const userErrorBanner4 = getUserBanner4(banners, userError)
userErrorBanner4
const userNoDetailsFilledBanner4 = getUserBanner4(banners, userNoDetailsFilled)
userNoDetailsFilledBanner4
// banner access is complicated now
const changedBanner4 = userOkBanner4.map(m => m.map(banner => 'changed ' + banner))
changedBanner4
// so, we need a flattening Maybies method... .join() or .flat()

Maybe.prototype.join = function (value) {
  return this.__value 
}

function getUserBanner5(banners, user) {
  return Maybe.of(user)
    .map(prop('accountDetails'))
    .map(prop('address'))
    .map(prop('province'))
    .map(getProvinceBanner)  // .map(prop(__, banners))
    .join()  // And now only one Maybe wrapper stays, profit!
}
const userOkBanner5 = getUserBanner5(banners, userOk)
userOkBanner5
const userNotLoggedBanner5 = getUserBanner5(banners, userNotLogged)
userNotLoggedBanner5
const userErrorBanner5 = getUserBanner5(banners, userError)
userErrorBanner5
const userNoDetailsFilledBanner5 = getUserBanner5(banners, userNoDetailsFilled)
userNoDetailsFilledBanner5


//////////////

// And if we need .mapping and .joining a lot - we can combine them together into .chain() or .flatMap() method

Maybe.prototype.chain = function (f) {
  return this.map(f).join()
}

// And now we can use one less step:
function getUserBanner6(banners, user) {
  return Maybe.of(user)
    .map(prop('accountDetails'))
    .map(prop('address'))
    .map(prop('province'))
    .chain(getProvinceBanner)
}
const userOkBanner6 = getUserBanner6(banners, userOk)
userOkBanner6
const userNotLoggedBanner6 = getUserBanner6(banners, userNotLogged)
userNotLoggedBanner6
const userErrorBanner6 = getUserBanner6(banners, userError)
userErrorBanner6
const userNoDetailsFilledBanner6 = getUserBanner6(banners, userNoDetailsFilled)
userNoDetailsFilledBanner6

// Reducing code size with Ramda //
function getUserBanner7(banners, user) {
  return Maybe.of(user)
    .map(path(['accountDetails', 'address', 'province']))
    .chain(getProvinceBanner)
}
const userOkBanner7 = getUserBanner7(banners, userOk)
userOkBanner7
const userNotLoggedBanner7 = getUserBanner7(banners, userNotLogged)
userNotLoggedBanner7
const userErrorBanner7 = getUserBanner7(banners, userError)
userErrorBanner7
const userNoDetailsFilledBanner7 = getUserBanner7(banners, userNoDetailsFilled)
userNoDetailsFilledBanner7


//////////////////

// Extracting value from a monad (but that's not necessarry!)
Maybe.prototype.getOrElse = function (defaultValue) {
  if (!this.exists()) return defaultValue
  return this.__value
}

// And helper for default value without extracting
Maybe.prototype.orElse = function (defaultValue) {
  if (!this.exists()) return Maybe.of(defaultValue)
  return this
}

// Now we can add default value if somewhere got null, for example - user come
// from unmentioned province:

const userWithUnexpectedProvince = {
  email: '',
  accountDetails: {
    address: {
      street: '',
      city: 'xxx',
      province: 'asdasasdasd',
      postcode: '0000123'
    }
  },
  preferences: {}
}

// Provide a default banner with .orElse()
const bannerSrc = getUserBanner7(userWithUnexpectedProvince)
  .orElse('/assets/banners/default-banner.jpg')
bannerSrc


////////////////


// Mocking document element
const document = {
  querySelector: str => ({ src: '', el: 'just mock of image DOM-node'})
}

// Now all that stuff got sorted, we can take DOM-element of image, and fill it
// with our Banner url:
const bannerEl = Maybe.of(document.querySelector('.banner > img'))
bannerEl


/////////////////


// Now we got two Maybes: bannerSrc and bannerEl — and we want to use them together,
// to set banner image. Specificially — we want to set the .src attribute of the DOM
// element in bannerEl to be a string inside bannerSrc.

// So, could we wrote a function, that expects two Maybes as inputs ?
const applyBanner = function (mBannerSrc, mBannerEl) {
  mBannerEl.__value.src = mBannerSrc.__value
  return mBannerEl
}
const appliedBannerSrcElement = applyBanner(bannerSrc, bannerEl)
appliedBannerSrcElement

// And it works, but until one of our .__value's was null, and we are also abandoning
// our main idea of working only inside Monad wrapper, that means we are not checking
// value emptiness with our monadic interface anymore.

// Lets rewrite it, we need to find a way to use .map() with our two Maybes.

// First of all, let's rewrite our applyBanner() function for working with regular values:
const applyBanner2 = curry(function (el, src) {  // changin params positions, and curried function
  el.src = src
  return el
})

// Now if we are mapping this function with bannerEl Maybe:
const mBannerWithourSrc = bannerEl.map(applyBanner2)
mBannerWithourSrc  // Here we got a function __value inside Maybe!
// And because of the currying, we got partially applied applyBanner2() with
// banner element included, and waiting for src param...


///////////////


// Now we got function as a Maybe value, and we some kind of .map() method,
// that works with a Maybe-wrapped function, and applies it to another Maybe with a Value.
// Maybe([function]) -> Maybe(value) => Maybe(function(value))

// Creating .ap() method for this:
Maybe.prototype.ap = function (maybeWithValue) {
  return maybeWithValue.map(this.__value)  // this.__value is our function, though
}

// Now putting it all together:
const mutatedBanner = bannerEl.map(applyBanner2).ap(bannerSrc)
mutatedBanner


////////////////

// This works, but it isn't super-clear, we have to remember that applyBanner2
// takes two parameters, and it's partially applied by bannerEl.map(), and only then
// it's applied to bannerSrc.

// It would be nicer, if we could make function, that takes our target function
// with two regular arguments, and tranform it for working with Maybe monads 

// And actually there are typical function, that called liftA2, for functions with 2 params:
const liftA2 = curry(function (fn, m1, m2) {  // we are assuming that fn is curried
  return m1.map(fn).ap(m2)
})

// Using liftA2, it becomes more consciece:
const applyBanner2Maybe = liftA2(applyBanner2)
applyBanner2Maybe
const mutatedBanner2 = applyBanner2Maybe(bannerEl, bannerSrc)
mutatedBanner2