import React from 'react';
import logo from './logo.svg';
import './App.css';
import { ServerPaginationGrid } from './DataTable';
import { useForm } from 'react-hook-form';
import * as yup from 'yup'
import { xml2js } from 'xml-js';



const schema = yup.object().shape({
  Root: yup.array().of(yup.object().shape({
    Vehicles: yup.array().of(yup.object().shape({
      Vehicle: yup.array().of(yup.object().shape({
        type: yup.string().required('required')
      }))
    }))
  }))
})

const customYupResolver = (schema: any) => {
  return async(values: any, _context:any, options: any) => {
    const names = { options }

    try {
      if(names && names.length > 0){
        await schema.validateAt(names[0], values, { abortEarly: false, context: values })
      } else {
        await schema.validate(values, { abortEarly: false, context: values })
      }

      return {
        values,
        errors: {}
      }
    }catch(error: any){
      let errors: Record<string, any> = {}
      if(error.inner) {
        error.inner.forEach((err: any) => {
          const nestedError = 
        })
      }
    }
  }
}

const App = () => {

  const xmlString = '<Root><Vehicles><Vehicle type="car" desc="Toyota"/><Vehicle type="bus" desc="Man"/><Vehicle type="Truck" desc="Ivenco"/><Vehicle type="car" desc="Mazda"/></Vehicles></Root>'

  const jsonXML = xml2js(xmlString, { compact: true, alwaysArray: true})

  console.log('json', jsonXML)

  const methods = useForm<any>({
    resolver: schema,
    mode: 'onChange'
  })

  return (
    <div className="App">
      <ServerPaginationGrid/>
    </div>
  );
}

export default App;
