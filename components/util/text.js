import React from 'react'
import {StyleSheet, Text } from 'react-native';


const defaultProps ={
    textContent: "",
    color: "white",
    weight: "normal",
    size: 14

}

class AText extends React.PureComponent {

    render() {
        const { textContent, color, weight, size } = this.props;
      
        return (
            
            <Text style={{color: color, fontWeight: weight, fontSize: size, }}>
                {textContent}
            </Text>

        );
    }
} 

AText.defaultProps = defaultProps;
 

export default AText;