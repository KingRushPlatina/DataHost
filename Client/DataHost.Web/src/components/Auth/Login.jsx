import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  Box, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Typography, 
  Alert,
  Container,
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material'
import { useAuth } from '../../contexts/AuthContext'

const Login = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(formData.username, formData.password)
      navigate('/')
    } catch (err) {
      setError('Credenziali non valide')
    }
  }

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card sx={{ width: '100%', maxWidth: 400, p: { xs: 2, sm: 4 } }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ width: 56, height: 56, mb: 2 }}>
              <img 
                src="https://www.gstatic.com/images/branding/product/2x/drive_2020q4_48dp.png" 
                alt="Drive" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </Avatar>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 400, color: '#202124' }}>
              Accedi a Drive
            </Typography>
          </Box>
          
          <form onSubmit={handleSubmit}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              margin="normal"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
            
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
            
            <Button 
              type="submit" 
              fullWidth 
              variant="contained" 
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              Accedi
            </Button>
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Non hai un account?{' '}
                <Link to="/register" style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
                  Registrati
                </Link>
              </Typography>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Container>
  )
}

export default Login  