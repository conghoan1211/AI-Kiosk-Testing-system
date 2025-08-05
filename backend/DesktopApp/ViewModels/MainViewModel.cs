using DesktopApp.Services;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace DesktopApp.ViewModels
{
    public class MainViewModel : INotifyPropertyChanged
    {
        private string _protectedUrl;

        public string ProtectedUrl
        {
            get => _protectedUrl;
            set { _protectedUrl = value; OnPropertyChanged(); }
        }

        public MainViewModel()
        {
        }

        public event PropertyChangedEventHandler PropertyChanged;
        protected void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}
