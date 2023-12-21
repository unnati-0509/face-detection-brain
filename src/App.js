import React , { Component } from 'react';
import ParticlesBg from 'particles-bg'
import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import './App.css';



const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
  }

  // componentDidMount() {
  //   fetch('http://localhost:3000/')
  //     .then(response => response.json())
  //     .then(console.log)
  // }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onPictureSubmit = () => {
    this.setState({imageUrl: this.state.input});

    fetch('https://smart-brain-server-wdaz.onrender.com/imageurl', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        input: this.state.input
      })
    })
      .then(response => response.json())
      .then(result => {
        const parsedData = JSON.parse(result);
        if(parsedData.status.description === "Ok"){
          fetch('https://smart-brain-server-wdaz.onrender.com/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
          .then(response => response.json())
          .then(count => {
            this.setState(Object.assign(this.state.user, {entries: count}))
          })
          .catch(console.log)

          this.displayFaceBox(this.calculateFaceLocation(parsedData))
        } else {
          throw new Error("Invalid Image URL");
        }
        })
      .catch(error => console.log('error', error));
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState);
      return;
    } else if (route === 'home'){
      this.setState({isSignedIn: true});
    }
    this.setState({route: route});
  }

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
        <ParticlesBg type="cobweb" num="100" color="#ffffff" bg={true} />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        { route === 'home'
          ? <div>
              <Logo />
              <Rank name={this.state.user.name} 
                    entries={this.state.user.entries}
              />
              <ImageLinkForm 
                onInputChange={this.onInputChange} 
                onPictureSubmit={this.onPictureSubmit} />
              <FaceRecognition box={box} 
                imageUrl={imageUrl} />
            </div>
          : (
            this.state.route === 'signin' 
            ? <Signin onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
            : <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
          )
        }
        </div>
    );
  }
}

export default App;