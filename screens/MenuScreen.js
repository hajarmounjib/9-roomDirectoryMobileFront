import React, { useState, useEffect } from "react";
import { TextInput, View, Text, StyleSheet } from "react-native";
import { Formik } from "formik";
import { RadioButton } from "react-native-paper";
import HomeImage from "../components/HomeImage";
import { ScrollView } from "react-native-gesture-handler";
import IPadress from "../url";
import { Overlay, Button } from "react-native-elements";

export default function MenuScreen({ route, navigation }) {
  // datas from props
  const token = route.params.token;
  const foodID = route.params.foodID;
  const price = route.params.price;

  //States
  const [visible, setVisible] = useState(false);
  const [foodDatas, setFoodDatas] = useState([]);
  const [checked, setChecked] = useState("");

  useEffect(() => {
    async function getFood() {
      const response = await fetch(
        `http://${IPadress}/restauration/breakfast/${foodID}`
      );
      const data = await response.json();
      const food = await data.result;
      setFoodDatas(food);
    }
    getFood();
  }, []);

  // const toggle overlay affiche message de conf et fait la requete en meme temps//
  const toggleOverlay = () => {
    setVisible(!visible);
  };

  return (
    <>
      {foodDatas.detail ? (
        <View style={styles.container}>
          <HomeImage uri={foodDatas.image} />
          <ScrollView style={{ padding: 10 }} scrollIndicatorInsets={{ top: 1, bottom: 1 }}
  contentInsetAdjustmentBehavior="always">
            <View style={styles.description}>
              <Text style={{ textAlign: "justify" }}>
                {foodDatas.description}
              </Text>
            </View>
            <View>
              <Formik
                initialValues={{}}
                onSubmit={async (values) => {
                  // store all entries of the values object
                  const valuesEntry = Object.entries(values);
                  // initialize an array where the details of the order will be push inside
                  let details = [];
                  // push only the object that doesn't contains an "heure" or "quantity" key into details array
                  for (let index = 0; index < valuesEntry.length; index++) {
                    if (
                      valuesEntry[index][0] !== "heure" &&
                      valuesEntry[index][0] !== "quantity"
                    ) {
                      let obj = {};
                      obj[valuesEntry[index][0]] = valuesEntry[index][1];
                      details.push(obj);
                    }
                  }

                  // store the current date (when the commande has been ordered)
                  const date = new Date().toString();

                  // send the order to the back
                  const sendOrder = await fetch(
                    `http://${IPadress}/restauration/order`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        details,
                        heure: values.heure,
                        quantity: values.quantity,
                        lieu: checked,
                        date,
                        price,
                        foodID,
                        token,
                      }),
                    }
                  )
                    .then((response) => {
                      response.json();
                    })
                    .then((data) => {
                      console.log("data: ", data);
                      setVisible(!visible);
                    })
                    .catch((err) => {
                      console.log("Something went wrong", err);
                    });
                }} 
              >
                {({ handleChange, handleBlur, handleSubmit, values }) => {
                  return (
                    <View>
                      <Text style={styles.title}>Quelques Pr??cisions</Text>
                      <View style={styles.details}>
                        <View>
                          <View>
                            <Text>Quantit?? :</Text>
                            <TextInput
                              onChangeText={handleChange("quantity")}
                              style={styles.input}
                              placeholder={"2"}
                              value={values.quantity}
                              keyboardType={"numeric"}
                            />
                          </View>

                          <View>
                            <Text>Heure :</Text>
                            <TextInput
                              style={styles.input}
                              onChangeText={handleChange("heure")}
                              placeholder={"9:30"}
                              value={values.heure}
                            />
                          </View> 
                        </View>

                        <View>
                          <Text>En chambre</Text>
                          <RadioButton
                            value="inRoom"
                            status={
                              checked === "inRoom" ? "checked" : "unchecked"
                            }
                            onPress={() => setChecked("inRoom")}
                          />
                          <Text>Sur place</Text>
                          <RadioButton
                            value="onSite"
                            status={
                              checked === "onSite" ? "checked" : "unchecked"
                            }
                            onPress={() => setChecked("onSite")}
                          />
                        </View>
                      </View>

                      {/* Choix */}

                      <Text style={styles.title}>Faites votre choix</Text>

                      {foodDatas.detail.map((categoryObj) => {
                        return Object.keys(categoryObj).map((category, i) => {
                          return (
                            <>
                              <Text key={i} style={styles.category}>
                                {category}
                              </Text>
                              {categoryObj[category].map((entry, i) => {
                                return (
                                  <View key={i} style={styles.choices}>
                                    <View style={styles.options}>
                                      <TextInput
                                        style={styles.input}
                                        onChangeText={handleChange(entry)}
                                        placeholder={"1"}
                                        keyboardType={"numeric"}
                                        value={values.entry}
                                      />

                                      <Text style={styles.itemOption}>
                                        {entry}
                                      </Text>
                                    </View>
                                  </View>
                                );
                              })}
                            </>
                          );
                        });
                      })}

                      <Button
                        buttonStyle={{
                          marginTop: 10,
                          marginBottom: 50,
                          backgroundColor: "#AADEC0",
                          width: 200,
                          color: "red",
                          alignSelf: "center",
                        }}
                        onPress={handleSubmit}
                        title="Valider"
                      />
                    </View>
                  );
                }}
              </Formik>
            </View>
          </ScrollView>
          <Overlay isVisible={visible} style={{ flexDirection: "column" }}>
            <Text>Votre commande a ??t?? enregistr??e.</Text>
            <Text>A tr??s bient??t ! </Text>
            <Button
              buttonStyle={{
                marginTop: 15,
                backgroundColor: "#AADEC0",
                width: "80%",
                alignSelf: "center",
              }}
              title="RETOUR"
              onPress={() => {
                toggleOverlay();
                navigation.navigate("BottomNavigator");
              }}
            />
          </Overlay>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  description: {
    paddingBottom: 10,
    width: "100%",
  },
  choices: {
    width: "100%",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  details: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 15,
  },
  category: {
    backgroundColor: "#AADEC0",
    padding: 3,
  },
  input: {
    height: 30,
    borderColor: "#AADEC0",
    borderWidth: 1,
    width: 30,
    textAlign: "center",
  },
  options: {
    flexDirection: "row",
    marginBottom: 10,
    marginTop: 10,
    alignItems: "center",
  },
  itemOption: {
    marginLeft: 10,
  },
});
