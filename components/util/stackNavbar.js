import React from 'react'
import { SafeAreaView, TouchableOpacity, View, Image, StyleSheet, Text, Dimensions } from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/FontAwesome'

const dime = Dimensions.get("screen");

const propTypes ={
    main: PropTypes.bool,


}  

const defaultProps ={
    navTitle: "",
}


class Navbar extends React.PureComponent {

    render() {
        const { navigation, navTitle, main } = this.props;
      
        return (
            
            <SafeAreaView>
                 
                {main ?
                (

                    <View style={styles.mainNav}>
                    
                        <Text style={styles.navTitle}>{navTitle}</Text>

                    </View> 
                
                )
            
                :
                (


                      

                        <View style={styles.mainNav}>
                        
                            <TouchableOpacity style={[styles.icon, styles.backNav]} onPress={()=>{navigation.goBack()}}> 
                                <Icon name={'chevron-left'} size={20} color={"white"}/> 
                            </TouchableOpacity>

                            <Text style={styles.navTitle}>{navTitle}</Text>

                        </View> 

                
                )
                }

            </SafeAreaView>

        );
    }
} 

Navbar.propTypes = propTypes;
Navbar.defaultProps = defaultProps;

const styles = StyleSheet.create({
    mainNav:{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#3056d3",
        height: dime.height*0.05,
        zIndex: 10,
    },
    logout:{
        fontWeight: "bold",
        color:"#ffffff"
    },
    navTitle:{
        fontSize: 22,
        color: "white",
        fontWeight: "bold",
    },



    backNav:{
        position: "absolute",
        left: 0,
        zIndex: 11,

//        TRY AND CENTER NAVBAR TITLE AND STUFF
    },


    icon:{
        
        width: dime.width/8,
        alignItems: "center",
        flexDirection: "row",
        justifyContent:"center",
    
    }



});

export default Navbar;