import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Cities from './components/Cities'
import Testimonials from './components/Testimonials'
import SignupForm from './components/SignupForm'
import Footer from './components/Footer'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <Hero />
      <HowItWorks />
      <Cities />
      <Testimonials />
      <SignupForm />
      <Footer />
    </div>
  )
}
