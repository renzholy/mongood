import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import Layout from 'layouts'
import Stats from './stats'

export default () => (
  <BrowserRouter>
    <Switch>
      <Layout>
        <Route path="/documents">
          <Stats />
        </Route>
        <Route path="/">
          <Stats />
        </Route>
      </Layout>
    </Switch>
  </BrowserRouter>
)
