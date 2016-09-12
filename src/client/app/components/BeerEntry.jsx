var axios = require('axios');
import React, {Component} from 'react';

export default class BeerEntry extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }
  imageSelector(beer, size) {
    let src;
    if (!beer.labels) {
      if (size === 'medium') {
        src = 'http://images.huffingtonpost.com/2016-01-26-1453821995-8643361-beermain.jpg';
      } else {
        src = 'https://www.beermenus.com/assets/favicons/favicon-af1a8d564621e02dc8e29aa32fc5f45edbeb492f8b1b9cc707f0dd88cad2cd64.ico';
      }
    } else {
      src = beer.labels[size];
    }
    return src;
  }
  breweryName(beer) {
    const name = beer.breweries !== undefined ? beer.breweries[0].name : '';
    return name;
  }
  componentWillMount() {
    console.log(this.props.beer); 
    this.setState({
      beerId: this.props.beer.id,
      description: this.props.beer.description,
      iconUrl: this.imageSelector(this.props.beer, 'icon'),
      imageUrl: this.imageSelector(this.props.beer, 'medium'),
      breweryName: this.breweryName(this.props.beer),
      beerName: this.props.beer.name,
      styleFamily: this.props.beer.styleFamily,
      styleFamilyId: this.props.beer.styleFamilyId,
      styleId: this.props.beer.styleId,
      abv: this.props.beer.abv,
      ibu: this.props.beer.ibu,
      srm: this.props.beer.srm,
      styleName: this.props.beer.style.name
    })
  }
  likeHandler(e) {
    const userId = localStorage.userId;
    const liked = e.target;
    const beer = {
      beerId: this.state.beerId,
      description: this.state.description,
      iconUrl: this.state.iconUrl,
      breweryName: this.state.breweryName,
      beerName: this.state.beerName,
      styleFamily: JSON.stringify(this.state.styleFamily),
      styleFamilyId: this.state.styleFamilyId,
      styleId: this.state.styleId,
      abv: this.state.abv,
      ibu: this.state.ibu,
      srm: this.state.srm
    }
    axios.post('/api/users/' + userId + '/beers', beer)
    .then((response) => {
      this.props.updateBeerLog();
    })
    .catch((err) => {
      console.log('Error posting like.')
    })
  }
  render() { 
    return (
        <div className="col s4">
          <div className="card small">
            <div className="card-image">
              <img style={{height: '100%', width: 'auto', margin: '5px auto', paddingBottom: '5px', borderRadius: '20px'}} className='responsive-img activator' src={this.state.imageUrl} />
            </div>
            <div className="card-content activator valign-wrapper">
              <span className="card-title activator grey-text text-
              darken-4" 
                style={{fontSize: '18px', lineHeight: '100%'}}>{this.state.beerName}
              </span><i className="material-icons right">more_vert</i>
              <p className='center-align valign'>
                <input 
                  type="checkbox" 
                  className="filled-in right" 
                  id={this.state.beerId} 
                  value={this.state.beerId}
                  onChange={this.likeHandler.bind(this)}
                />
                <label htmlFor={this.state.beerId}></label>
              </p>
            </div>
            <div className="card-reveal">
              <span className="card-title grey-text text-darken-4">
                {this.state.styleName}
                <i className="material-icons right">close</i>
              </span>
              <p>{this.state.description}</p>
            </div>
          </div>
        </div>
    );
  }
}