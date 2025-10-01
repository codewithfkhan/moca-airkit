import { Fragment } from 'react'
import CustomImage from '../CustomImage'
import { images } from '../../constants'

const VerificationNote = (props) => {
    const {note, info} = props
  return (
    <Fragment>
        <div className='verification-note-box bg-white rounded-2x overflow-hidden'>
            <div className='note_box d-flex align-items-center justify-content-center my-3 mx-3'>
                <div className='note_img_box'>
                    <CustomImage src={images.verifiedCheck} alt="Note Icon" className="img-fluid" />
                </div>
                <div className='note_text_box ms-1'>
                    <h1 className='text-dark mb-0 fs-15 text-start'>{note}</h1>
                </div>
            </div>
            <div className='note_info_box mt-2 bg-note-info'>
                <div className="d-flex align-items-center justify-content-center">
                    <div className='note_img_box'>
                    <CustomImage src={images.LockImg} alt="Note Icon" className="img-fluid" />
                </div>
                <div className='note_text_box ms-1'>
                    <h2 className='text-secondary mb-0 fs-10'>{info}</h2>
                </div>
                </div>
            </div>
        </div>
    </Fragment>
  )
}

export default VerificationNote