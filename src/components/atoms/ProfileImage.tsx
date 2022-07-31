import * as React from "react";
import {StaticImage} from "gatsby-plugin-image";
// @ts-ignore
import * as staticImageStyles from "./ProfileImage.module.css"

const ProfileImage: React.FC = () => {
    return (
        <StaticImage
            alt="Daisaku Suzuki"
            src="../../../static/avatar/profile.jpg"
            className={staticImageStyles.image}
        />
    )
}
export default ProfileImage
