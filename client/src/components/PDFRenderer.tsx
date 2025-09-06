import React from "react";
import {
  Page,
  Text,
  Image,
  Document,
  StyleSheet,
  View,
  Font,
  Link,
} from "@react-pdf/renderer";
import { Grave } from "../interfaces/GraveIntefaces";

Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
});

const styles = StyleSheet.create({
  body: {
    paddingTop: 35,
    paddingBottom: 45,
    paddingHorizontal: 35,
    fontFamily: "Roboto",
    backgroundColor: "#ffffff",
    padding: 24,
  },
  page: {
    fontFamily: "Roboto",
    backgroundColor: "#ffffff",
    padding: 24,
  },
  section1: {
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "space-evenly",
    backgroundColor: "#c3c4c5",
    margin: "20px",
  },
  section2: {
    flexDirection: "column",
    justifyContent: "space-evenly",
    backgroundColor: "#c3c4c5",
    alignItems: "center",
    margin: "20px",
  },
  minisection: {
    margin: "25px",
    height: "400px",
    width: "300px",
  },
  title: {
    fontSize: 24,
    textAlign: "center",
  },
  text: {
    margin: 12,
    fontSize: 14,
    textAlign: "justify",
    // fontFamily: "Times-Roman",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  topheader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: "7px",
  },
  header: {
    fontSize: 24,
    marginBottom: 2,
    textAlign: "center",
    color: "grey",
  },
  pageNumber: {
    position: "absolute",
    fontSize: 12,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "grey",
  },
});
interface PDFRendererProps {
  grave: Grave;
  mapImageUrl: string;
}

const PDFFile: React.FC<PDFRendererProps> = ({ grave, mapImageUrl }) => {
  console.log("PDF RENDERER EXECUTION");
  //  console.log(mapImageUrl);
  const currentURL = window.location.href;
  //console.log("Trenutni URL:", currentURL);
  return (
    <Document>
      <Page style={styles.body} orientation="portrait">
        <View style={styles.topheader} fixed>
          <View>
            <Text style={styles.header}>
              Naziv Groblja: {grave?.cemetery?.name}
            </Text>
            <Text style={styles.header}>Polje: {grave?.field}</Text>
            <Text style={styles.header}>Red: {grave?.row}</Text>
            <Text style={styles.header}>Broj: {grave?.number}</Text>
            <Text style={styles.header}>
              Broj pokojnika: {grave?.deceased.length}{" "}
            </Text>
          </View>
        </View>
        <View style={styles.section1}>
          <Image src={mapImageUrl} />
        </View>
        <View style={styles.section2}>
          <Text>Kraj open mape</Text>
          <Link src={currentURL}>Idi na stranicu</Link>
        </View>
        {/* <Image [...Array(20).keys()]
              style={styles.image}
              src={picture.resPath}
            /> */}
        {/*    <Image style={styles.image} src={LebronStretch} /> */}

        <Text
          fixed
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
        />
      </Page>
    </Document>
  );
};

export default PDFFile;
