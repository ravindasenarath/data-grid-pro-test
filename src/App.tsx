import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { ServerPaginationGrid } from './DataTable';
import { FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup'
import { xml2js } from 'xml-js';
import { merge } from 'lodash';

const vehiclesPath = 'Root.0.Vehicles.0.Vehicle'

const setNestedError = (path: string, errorMessage: string) => {
  const pathParts = path.split('.')
  return pathParts.reduceRight<Record<string, any>>((value, key) => {
    const arrayMatch = key.match(/(\w+)\[(\d+)\]/)
    if (arrayMatch) {
      const [, arrayKey, index] = arrayMatch
      return { [arrayKey]: Array(Number(index) + 1).fill(undefined).map((_, i) => i === Number(index) ? value : undefined) }
    }
    return { [key]: value }
  }, {
    message: errorMessage,
    type: 'validation',
    ref: {}
  })
}

const schema = yup.object().shape({
  Root: yup.array().of(yup.object().shape({
    Vehicles: yup.array().of(yup.object().shape({
      Vehicle: yup.array().of(yup.object().shape({
        type: yup.string().required('required')
      }))
    }))
  }))
})

export const customYupResolver = (schema: any) => {
  return async (values: any, _context: any, options: any) => {
    const { names } = options

    try {
      if (names && names.length > 0) {
        await schema.validateAt(names[0], values, { abortEarly: false, context: values })
      } else {
        await schema.validate(values, { abortEarly: false, context: values })
      }

      return {
        values,
        errors: {}
      }
    } catch (error: any) {
      let errors: Record<string, any> = {}

      if (error.inner) {
        error.inner.forEach((err: any) => {
          const nestedError = setNestedError(err.path, err.message)
          errors = merge(errors, nestedError)
        })
      }

      return {
        values: {},
        errors
      }
    }
  }
}

const App = () => {

  const xmlString = '<Root><Vehicles><Vehicle type="car" desc="Toyota"/><Vehicle type="bus" desc="Man"/><Vehicle type="Truck" desc="Ivenco"/><Vehicle type="car" desc="Mazda"/></Vehicles></Root>'

  const jsonXML = xml2js(xmlString, { compact: true, alwaysArray: true})

  console.log('json', jsonXML)

  useEffect(() => {
    methods.reset(jsonXML)
  }, [jsonXML])

  const methods = useForm<any>({
    resolver: customYupResolver(schema),
    mode: 'onChange'
  })

  return (
    <div className="App">
      <FormProvider {...methods}>
        <ServerPaginationGrid
          datapath={vehiclesPath}
        />
      </FormProvider>
    </div>
  );
}

export default App;
