import React from 'react';

export default () => {
  return (
    <div id="modal1" className="modal modal-fixed-footer">
      <div className="modal-content">
        <h3 className='center-align'>Executing Algorithm...</h3>
          <div className='center-align'>
            <div id="preloader" className="preloader-wrapper big active">
              <div className="spinner-layer spinner-green-only">
               <div className="circle-clipper left">
                 <div className="circle"></div>
               </div>
               <div className="gap-patch">
                 <div className="circle"></div>
               </div>
               <div className="circle-clipper right">
                 <div className="circle"></div>
               </div>
              </div>
            </div>   
          </div>  
        <h5 className='center-align'>Aligning Satellites...</h5>
        <h5 className='center-align'>Activating Quantum Super Computers...</h5>
        <h5 className='center-align'>Performing Multi-Factor Regressive Linear Analysis...</h5>
        <h5 className='center-align'>Asking future you if you liked the beer...</h5>
        <h5 className='center-align'>Washing Beer Steins...</h5>
        <h5 className='center-align'>Wait for it...</h5>
      </div>
    </div>
  );
}