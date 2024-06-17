import React, { useEffect, useState, useRef } from "react";
import { auth } from "../../Components/firebase/firebase"; // Assuming you have a firebase config file
import { useNavigate } from "react-router-dom";
import {Typed} from "react-typed";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import emailjs from 'emailjs-com';

function Home() {
  const typedElement = useRef(null);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const form = useRef();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const book = () => {
    if (user) {
      navigate("/book/select-pet");
    } else {
      navigate("/signIn");
      toast.error("Please log in first to continue your booking!", {
        autoClose: 2000,
        onClose: () => {
          forceUpdate();
        },
      });
    }
  };

  const sendEmail = (e) => {
    e.preventDefault();
    const formData = new FormData(form.current);
    formData.append('to_name', userName);
    emailjs.sendForm('service_9sprp0p', 'template_pz8ey59', form.current, 'gWym0COHJFeyRWp5M')
      .then((result) => {
        console.log(result.text);
        toast.success("Email sent successfully!");
      }, (error) => {
        console.log(error.text);
        toast.error("Failed to send email.");
      });

    e.target.reset();
  };

  useEffect(() => {
    const options = {
      strings: ["Grooming", "Healthcare", "Daycare", "Bathing"],
      typeSpeed: 50,
      backSpeed: 50,
      backDelay: 400,
      loop: true,
    };

    const typed = new Typed(typedElement.current, options);

    return () => {
      typed.destroy();
    };
  }, []);

  useEffect(() => {
    ScrollReveal().reveal(".home-content, .heading", {
      origin: "top",
      distance: "80px",
      duration: 2000,
      delay: 200,
    });
    ScrollReveal().reveal(
      ".home-img, .services-container, .portfolio-box, .contact form",
      { origin: "bottom", distance: "80px", duration: 2000, delay: 200 }
    );
    ScrollReveal().reveal(".home-container h1, .about-img", {
      origin: "left",
      distance: "80px",
      duration: 2000,
      delay: 200,
    });
    ScrollReveal().reveal(".home-container p, .about-content", {
      origin: "right",
      distance: "80px",
      duration: 2000,
      delay: 200,
    });
  }, []);
  const homePage = () => {
    if (dropdownOpen) {
      setDropdownOpen(false); // Close dropdown if open
    }
    navigate("/#home");
  };
  useEffect(() => {
    const fetchAllBookings = async () => {
      const db = getDatabase();
      const usersRef = ref(db, "users");
      const snapshot = await get(usersRef);
      const usersData = snapshot.val();
      let allBookings = [];
      // console.log("Users Data:", usersData); 

      if (usersData) {
        Object.keys(usersData).forEach((userId) => {
          const userData = usersData[userId];
          if (userData.bookings) {
            Object.keys(userData.bookings).forEach((bookingId) => {
              const booking = userData.bookings[bookingId];
              allBookings.push({
                userId,
                bookingId,
                ...booking,
              });
            });
          }
        });
      }
      // console.log("All Bookings:", allBookings);
      setBookedSlots(allBookings);
    };

    fetchAllBookings();
  }, []);
  

  useEffect(() => {
    const hasEnoughSlides = bookedSlots.length > slidesPerView;
    setLoop(hasEnoughSlides);
  }, [bookedSlots.length, slidesPerView]);

  const renderRatedBookings = () => {
    const ratedBookings = bookedSlots.filter(
      (booking) => booking.status === 'Rated' && booking.rating > 3
    );

    return ratedBookings.map((booking, index) => (
      <SwiperSlide key={booking.id} virtualIndex={index}>
        <div className="testimonial-box">
          <img
            className="testimonial-avatar"
            src={booking.pet.imageUrl}
            alt="User Avatar"
          />
          <div className="testimonial-content">
            <div style={{ fontSize: '3rem', color: 'var(--text-color)' }}>
              Rating:
            </div>
            <Box
              sx={{
                marginTop: '12px',
                width: 200,
                display: 'flex',
                alignItems: 'center',
                float: 'right',
              }}
            >
              <Box sx={{ ml: 2, fontSize: '2rem', marginRight: '12px' }}>
                {booking.rating.toFixed(1)}
              </Box>
              <Rating
                name="read-only"
                value={booking.rating}
                readOnly
                sx={{
                  '& .MuiRating-iconFilled': {
                    color: 'gold',
                  },
                }}
              />
            </Box>
            <div className="testimonial-text">
              <div style={{ fontSize: '3rem', color: 'var(--text-color)', marginBottom: '20px', marginTop: '10px' }}>
                Review:
              </div>
              {booking.review}
            </div>
            <p className="testimonial-signature">
              {booking.username}, {booking.pet.name}
            </p>
          </div>
        </div>
      </SwiperSlide>
    ));
  };

  return (
    <div>
      <div id="root">
        <section className="home-section" id="home">
          <div className="home-content">
            <h3>Welcome to PetCenter</h3>
            <h1>Your One-Stop Solution for Pet Care</h1>
            <h3>
              We Provide{" "}
              <span ref={typedElement} className="multiple-text"></span> Service
            </h3>
            <p>
              At PetCenter, we enhance the lives of pets and their owners with a
              wide range of services. From grooming and veterinary care to
              training and daycare, we're here to support you and your furry
              friends.
            </p>
            <a onClick={book} className="btn">
              Book now
            </a>
          </div>
          <div className="home-img">
            <img
              src="https://scontent.fsgn2-6.fna.fbcdn.net/v/t39.30808-6/440942530_423620990437817_5689570377664203254_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=5f2048&_nc_ohc=BFrjCE_IQ8AQ7kNvgHNUkAr&_nc_ht=scontent.fsgn2-6.fna&oh=00_AYAE-6ge9dx5ooH4pzNnSfurgsz5i8tv1ymwOloTS8-CyQ&oe=66576FD2"
            />
          </div>
        </section>
      </div>
      <section className="about" id="about">
        <div className="font_0" data-aos="fade-in">
          <h3>Hi, I'm Dr. Mark Edwards</h3>
        </div>

        <div className="about-container">
          <div className="about-image" data-aos="fade-right">
            <img
              className="img-about"
              src="https://static.wixstatic.com/media/84770f_ec1b885cde544df1bf299c3d35749700~mv2_d_3848_3848_s_4_2.jpg/v1/fill/w_513,h_513,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/84770f_ec1b885cde544df1bf299c3d35749700~mv2_d_3848_3848_s_4_2.jpg"
              alt=""
              width="410"
              height="410"
              srcSet="https://static.wixstatic.com/media/84770f_ec1b885cde544df1bf299c3d35749700~mv2_d_3848_3848_s_4_2.jpg/v1/fill/w_513,h_513,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/84770f_ec1b885cde544df1bf299c3d35749700~mv2_d_3848_3848_s_4_2.jpg"
              fetchpriority="high"
            ></img>
          </div>
          <div className="about-text" data-aos="fade-left">
            <span className="text-about">
              Over 16 Years of Veterinary Experience
            </span>
            <p className="font_1">
              <span className="text1-about">
                With over 16 years of experience working in the field of
                veterinary medicine, I am a passionate veterinarian with a deep
                understanding of the health and happiness of pet animals. I
                graduated from Hanoi National University School of Medicine and
                have worked at many reputable veterinary clinics and veterinary
                hospitals throughout the area. Through thousands of animal
                treatment and care cases, I have accumulated valuable experience
                and diverse professional skills. I am always dedicated and
                dedicated to caring for each patient, along with dedicated
                understanding and advice to owners on how to care for and
                protect their pets' health.
              </span>
            </p>
          </div>
        </div>
        <div className="about-container">
          <div className="about-text2" data-aos="fade-right">
            <span className="text-about">
              Over 16 Years of Veterinary Experience
            </span>
            <p className="font_1">
              <span className="text1-about">
                In addition to my daily work, I also regularly participate in
                community education activities to share my knowledge and
                experience with the community, while creating high awareness of
                health issues and disease prevention for people. animal. My
                mission is to bring peace and happiness to every family through
                health care for their pets. With enthusiasm and extensive
                knowledge, I am committed to continuing to contribute to the
                development of the field of veterinary medicine and bring the
                best care services to the community.
              </span>
            </p>
          </div>
          <div className="about-image2" data-aos="fade-left">
            <img
              className="img-about"
              src="https://static.wixstatic.com/media/84770f_e57bb42011fe4e91992f1ceeece2a7b3~mv2_d_4000_3947_s_4_2.jpg/v1/fill/w_526,h_519,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/84770f_e57bb42011fe4e91992f1ceeece2a7b3~mv2_d_4000_3947_s_4_2.jpg"
              fetchpriority="high"
            ></img>
          </div>
        </div>
        <div className="font_2" data-aos="zoom-in-up">
          <h3>What Our Happy Clients Say</h3>
        </div>
        <div>
        <div className="testimonial-container" data-aos="fade-up">
        <Swiper
        modules={[Autoplay]}
      spaceBetween={50}
      slidesPerView={slidesPerView}
      loop={loop}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
    >
      {renderRatedBookings()}
    </Swiper>
    </div>

    </div>
      </section>
      <section className="services" id="services">
        <div className="font_3" data-aos="zoom-in-down">
          <h3 style={{ marginTop: "68px" }}>
            Your pet deserves to be pampered!
          </h3>
        </div>
        <div className="big-line"></div>

        <div className="card-container">
          <div className="card" data-aos="fade-right" onClick={book}>
            <h2>GROOMING</h2>

            <p>
              This service includes bathing, hair cutting and eye cleaning,
              combing, and skin examinations, requiring the groomer to
              understand the pet's temperament.
            </p>
            <img
              className="card-avatar"
              src="https://bpanimalhospital.com/wp-content/uploads/shutterstock_1547371985.jpg"
              alt="User Avatar"
            />
            <div className="pricing">30 min: $21.00 | 60 min: $36.00</div>
          </div>
          <div className="card" data-aos="fade-up" onClick={book}>
            <h2>CHECK UP</h2>

            <p>
              This service involves a comprehensive physical examination of the
              pet's body, including measurements of temperature, blood pressure,
              heart rate and weight
            </p>
            <img
              className="card-avatar"
              src="https://www.cherrycreekvet.com/blog/wp-content/uploads/2024/03/iStock-1445008380-3-1-2000x1333.jpg"
              alt="User Avatar"
            />
            <div className="pricing">$50.00</div>
          </div>
          <div className="card" data-aos="fade-left" onClick={book}>
            <h2>Vaccination</h2>

            <p>
              Pet immunizations are crucial for preventative pet healthcare,
              protecting against harmful illnesses, and are widely discussed
              among veterinarians and pet owners
            </p>
            <img
              className="card-avatar"
              src="https://media.istockphoto.com/id/966384466/vi/anh/c%E1%BA%AFt-h%C3%ACnh-%E1%BA%A3nh-ng%C6%B0%E1%BB%9Di-%C4%91%C3%A0n-%C3%B4ng-c%E1%BA%A7m-beagle-trong-khi-b%C3%A1c-s%C4%A9-th%C3%BA-y-ti%C3%AAm-b%E1%BA%B1ng-%E1%BB%91ng-ti%C3%AAm-v%C3%A0o-n%C3%B3.jpg?s=612x612&w=0&k=20&c=ViUs_0PoS5B26q7ScYHNx21sj8hMlcburn_H_aREbSM="
              alt="User Avatar"
            />
            <div className="pricing">$36.00</div>
          </div>
          <div className="card" data-aos="fade-right" onClick={book}>
            <h2>PET VETERINARY</h2>

            <p>
              This service offers complete medical care for animals, including
              the identification and management of diseases, traumas, and other
              health issues.
            </p>
            <img
              className="card-avatar"
              src="https://media.istockphoto.com/id/1171733307/vi/anh/b%C3%A1c-s%C4%A9-th%C3%BA-y-v%E1%BB%9Bi-ch%C3%B3-v%C3%A0-m%C3%A8o-ch%C3%B3-con-v%C3%A0-m%C3%A8o-con-t%E1%BA%A1i-b%C3%A1c-s%C4%A9.jpg?s=612x612&w=0&k=20&c=eZRCsHMznU16Nr89IkT6ETLH3Enzt9TwBUx4mIxZhzE="
              alt="User Avatar"
            />
            <div className="pricing">30 min: $21.00 | 60 min: $36.00</div>
          </div>
        </div>
        <div className="font_4" data-aos="flip-up">
          <h3>Pet Moment!</h3>
        </div>
        <div className="big-line"></div>
        <div className="slide-show-container">
          <div
            className="slide-show-background"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          ></div>
          <div className="slide-show">
            <div
              className="list-images"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              <div className="slide">
                <div className="image-wrapper">
                  <img src="https://thuythithi.com/wp-content/uploads/2020/03/tim-bac-si-thu-y-uy-tin-chua-benh-cho-cho-meo-tai-tp-hcm.jpg"></img>
                </div>
              </div>
              <div className="slide">
                <div className="image-wrapper">
                  <img src="https://thuythithi.com/wp-content/uploads/2020/03/doi-ngay-bac-si-thu-y-khi-thay-nhung-dau-hieu-sau-de-thu-cung-cua-ban-luon-khoe-manh.jpg"></img>
                </div>
              </div>
              <div className="slide">
                <div className="image-wrapper">
                  <img src="https://media.istockphoto.com/id/1371820919/vi/anh/y-t%C3%A1-tr%E1%BA%BB-nh%C3%ACn-labrador.jpg?s=612x612&w=0&k=20&c=FMAM4UXefhcSVe82TTvMNEh8HtR7hIUjshzEK4e5Hd4="></img>
                </div>
              </div>
              <div className="slide">
                <div className="image-wrapper">
                  <img src="https://ttol.vietnamnetjsc.vn/images/2019/01/27/21/51/photo-1-15485795786021781044006.jpg"></img>
                </div>
              </div>
              <div className="slide">
                <div className="image-wrapper">
                  <img src="https://media.istockphoto.com/id/1044460686/vi/anh/b%C3%A1c-s%C4%A9-s%E1%BB%AD-d%E1%BB%A5ng-%E1%BB%91ng-nghe-tr%C3%AAn-m%E1%BB%99t-con.jpg?s=612x612&w=0&k=20&c=gbP097Z9ZDOzN2v_a7SVAmDYO2aZsGKmsRf5wCyHkHo="></img>
                </div>
              </div>
              <div className="slide">
                <div className="image-wrapper">
                  <img src="https://media.istockphoto.com/id/1303833920/vi/anh/nam-b%C3%A1c-s%C4%A9-th%C3%BA-y-ki%E1%BB%83m-tra-ch%C3%B3-t%E1%BA%A1i-ph%C3%B2ng-kh%C3%A1m-th%C3%BA-y.jpg?s=612x612&w=0&k=20&c=JpWoIV99ZHVm-jLZn_p2rSlSQ0MPqdQzB-QmXAmwnjQ="></img>
                </div>
              </div>
            </div>
            <div className="button-slide">
              <button className="prev" onClick={prevSlide}>
                &#10094;
              </button>
              <button className="next" onClick={nextSlide}>
                &#10095;
              </button>
            </div>
            <div className="dot-container">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <span
                  key={index}
                  className={`dot ${index === currentSlide ? "active" : ""}`}
                  onClick={() => currentSlideHandler(index)}
                ></span>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="contact" id="contact">
        <h2 className="heading">
          Contact <span>Us!</span>
        </h2>
        <form ref={form} onSubmit={sendEmail}>
          <div className="input-box">
            <input type="text" name="from_name" placeholder="Full Name" required />
            <input type="email" name="from_email" placeholder="Email Address" required />
          </div>
          <div className="input-box">
            <input type="number" name="from_phone" placeholder="Mobile Number" required />
            <input type="text" name="subject" placeholder="Your Address" required />
          </div>
          <textarea name="message" cols="30" rows="10" placeholder="Your Message" required></textarea>
          <input type="submit" value="Send Message" className="btn" />
        </form>
      </section>

      {/* footer design */}
      <footer className="footer">
        <div className="footer-text">
          <p>Copyright &copy; 2024 by NJS1804 - Team3 | All Rights Reserved.</p>
        </div>
        <div className="footer-iconTop" style={{fontSize: "2rem"}}>
          <a style={{padding: "1rem 1.2rem", borderRadius: "50%", display: "inline-flex"
    ,justifyContent: "center"
    ,alignItems: "center", color: "#fff"}} href="#home"><FontAwesomeIcon icon={faArrowUp} /></a>
        </div>
      </footer>
    </div>
  );
}

export default Home;
