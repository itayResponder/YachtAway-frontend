<template>
  <!-- <div class="content" v-if="yacht"> -->
  <nav v-if="yacht" class="panel has-text-centered sticky-fix" style="margin-top:1.9rem;">
    <!-- TODO: MAYBE CHANGE THE TEXT OF PRICE PER NIGHT -->
    <p class="panel-heading is-black has-background-white" style="border-bottom: 0">PRICE PER NIGHT</p>
    <div class="panel-block">
      <p class="control has-icons-left">
        <input
          v-model="fromDate"
          class="touch-only input has-text-centered"
          type="date"
          placeholder="dates"
        />
        <input
          v-model="toDate"
          class="touch-only input has-text-centered"
          type="date"
          placeholder="dates"
        />

        <!-- ################## 
        TODO
          ON GOING WORK : 
        BUTTON TO SHOW THE CALENDAR YOU SEE IN THE DETAILS-->
        <!-- <button
          class=" is-fullwidth button is-white is-small"
          @click="isCalendarShowModalActive = true"
        >Pick a date</button>
        <b-modal :active.sync="isCalendarShowModalActive" has-modal-card>
          <calendar-show ></calendar-show>
        </b-modal>-->
        <!-- ############### -->

        <span class="icon is-small is-left">
          <i class="fas fa-search" aria-hidden="true"></i>
        </span>
      </p>
    </div>
    <div class="panel-block">
      <p class="control">
        <input
          v-model="numOfGuest"
          min="1"
          class="input is-normal has-text-centered"
          type="number"
          placeholder="How Many Guests"
        />
      </p>
    </div>

    <div class="panel-block">
      <span class="control is-medium is-left has-text-centered">{{yacht.pricePerNight}} $</span>
    </div>
    <div class="panel-block">
      <button @click="makeReservation" class="button is-primary is-fullwidth">Book it now</button>
    </div>
    <div v-if="getWhatsappLink" class="panel-block">
      <a
        target="_blank"
        :href="getWhatsappLink"
        class="button is-success has-text-grey-dark is-outlined is-button is-fullwidth"
      >
      <span class="icon is-small is-left">
            <img src="@/assets/icons/whatsapp.svg" alt="whatsapp" />
            &nbsp; &nbsp;
          </span>
      {{phoneContactText}}
      </a>
    </div><br/><br/>
    <!-- <paypal-checkout amount="10.00" currency="USD" :client="paypal"></paypal-checkout> -->
    <div ref="paypal" class="panel-block">
      <button class="button is-fullwidth is-outlined">
        <paypal-payment :product="product"></paypal-payment>
      </button>
    </div>
  </nav>
  <!-- </div> -->
</template>

<script>
import calendarShow from "@/components/general/CalendarShow";
import Swal from "sweetalert2";
import paypalPayment from "@/components/yacht/PaypalPayment";

export default {
  props: ["yacht"],
  data() {
    return {
      isCalendarShowModalActive: false,
      fromDate: "2019-07-19", //null,
      toDate: "2019-07-20", //null,
      numOfGuest: null,
      reservation: null,

      //PAYPAL
      paypal: {
        sandbox:
          "AZ6xr8gYUAQmdYCyypx0nLIov3aFmkZdZTJ2__Bu44IkvvRTtvuIwTx3--3f1V0OON87SKK5tg7yxIaF",
        production:
          "AVZhosFzrnZ5Mf3tiOxAD0M6NHv8pcB2IFNHAfp_h69mmbd-LElFYkJUSII3Y0FPbm7S7lxBuqWImLbl"
      },
      product: {
        price: this.yacht.pricePerNight,
        description: "This Yacht"
        // img: 'yac'
      }
    };
  },
  
  methods: {
    createUserObj() {
      // create USER object
      const { firstName, _id, img } = this.$store.getters.userLoggedIn;
      const user = {};
      user.name = firstName;
      user._id = _id;
      user.img = img;
      return user;
    },
    createYachtObj() {
      // create YACHT object
      const yacht = { owner: {} };
      yacht._id = this.$route.params.id;
      yacht.name = this.yacht.name;
      yacht.pricePerNight = this.yacht.pricePerNight;
      yacht.img = this.yacht.imgs[0];
      yacht.owner.img = this.yacht.owner.img;
      yacht.owner.email = this.yacht.owner.email;
      yacht.owner.name = this.yacht.owner.name;
      return yacht;
    },
    async makeReservation() {
      const fromDate = this.fromDate;
      const toDate = this.toDate;
      const numOfGuest = this.numOfGuest;
      const user = this.createUserObj();
      const yacht = this.createYachtObj();
      const createdAt = Date.now();

      // send wantedReservation
      const currReservation = {
        numOfGuest,
        fromDate,
        toDate,
        yacht,
        user,
        createdAt
      };

      if (fromDate && toDate && numOfGuest > 0) {
        // CHECK IF IT IS  A REAL DATE :
        // if(!isNaN(Date.parse(startDate))  && !isNaN(Date.parse(endDate)) )
        try {
          this.reservation = await this.$store.dispatch({
            type: "makeReservation",
            currReservation
          });
          await Swal.fire(
            "Allright",
            `Thank you! Your reservation confirmation is: ${this.reservation._id}
		the owner yacht will contact you soon!`,
            "success"
          );
        } catch (err) {
          await Swal.fire(
            "Sorry",
            `Sorry somthing went wrong! dont worry we didnt
		overcharged you ;)`,
            "error"
          );
          console.log("Coule not save reservation error:", err);
          return;
        }
        try {
          //Send message to Owner yacht
          this.reservation.yacht.owner._id = this.yacht.owner._id;
          const pendingReservation = await this.$store.dispatch({
            type: "pendingReservation",
            reservation: this.reservation
          });
        } catch (err) {
          console.log("Could not send message error:", err);
        }
        this.$router.push("/profile/reservation");
      } else {
        this.$toast.open({
          duration: 4050,
          message: `Check you have dates and number of guests`,
          position: "is-top",
          type: "is-warning"
        });
      }
    }
  },
  computed: {
    getWhatsappLink() {
      if (!this.yacht || !this.yacht.owner || !this.yacht.owner.name)
        return false;
      const api = "https://api.whatsapp.com/send?l=en";
      const txt = `Hi! I'm interested in one of your Yachts, specifically in : ${this.yacht.name}`;
      // for now we not load it from DB :
      let phone = "";
      // for now we not load it from DB :
      if (this.yacht.owner.name.toLowerCase() === "niv") phone = "972548082717";
      else if (this.yacht.owner.name.toLowerCase() === "nadav")
        phone = "972523831348";
      else if (this.yacht.owner.name.toLowerCase() === "itay")
        phone = "972507161645";
      else phone = "";

      this.phoneContactText = "Contact";
      const whatsappLink = encodeURI(`${api}&phone=${phone}&text=${txt}`);
      return whatsappLink;
    }
  },
  components: {
    calendarShow,
    paypalPayment
  }
};
</script>

<style scoped>
.sticky-fix {
  position: sticky;
  z-index: 30;
  top: 64px;
  right: inherit;
  left: inherit;
}
</style>
